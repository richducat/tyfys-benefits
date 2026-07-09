<?php
declare(strict_types=1);

require __DIR__ . '/bootstrap.php';
require_once __DIR__ . '/customer-sync-lib.php';

const TYFYS_CUSTOMER_ADMIN_COOKIE = 'tyfys_customer_admin';
const TYFYS_CUSTOMER_ADMIN_TTL = 43200;

function crm_headers(): array
{
    $origin = tyfys_safe_string($_SERVER['HTTP_ORIGIN'] ?? '', 240);
    $headers = [
        'Cache-Control' => 'no-store',
        'X-Robots-Tag' => 'noindex, nofollow',
    ];

    if ($origin !== '') {
        $host = parse_url($origin, PHP_URL_HOST);
        $host = is_string($host) ? strtolower($host) : '';
        if (in_array($host, ['tyfys.net', 'www.tyfys.net', 'customer.tyfys.net'], true)) {
            $headers['Access-Control-Allow-Origin'] = $origin;
            $headers['Access-Control-Allow-Credentials'] = 'true';
            $headers['Vary'] = 'Origin';
        }
    }

    return $headers;
}

function crm_json(int $status, array $payload): void
{
    tyfys_json_response($status, $payload, crm_headers());
}

function crm_secret(): string
{
    $secret = tyfys_config('TYFYS_CUSTOMER_PORTAL_SECRET', 'TYFYS_AUTH_PEPPER', 'TYFYS_REACTIVATION_LINK_SECRET');
    return $secret !== '' ? $secret : 'tyfys-customer-crm';
}

function crm_admin_session_token(): string
{
    return tyfys_safe_string($_COOKIE[TYFYS_CUSTOMER_ADMIN_COOKIE] ?? '', 160);
}

function crm_admin_session_hash(string $token): string
{
    return hash('sha256', $token . ':' . crm_secret());
}

function crm_ensure_schema(?PDO $pdo): void
{
    if (!$pdo) {
        return;
    }

    static $done = false;
    if ($done) {
        return;
    }

    $pdo->exec("CREATE TABLE IF NOT EXISTS customer_admin_sessions (
        token_hash VARCHAR(128) PRIMARY KEY,
        username VARCHAR(80) NOT NULL,
        created_at DATETIME NOT NULL,
        expires_at INT NOT NULL
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4");

    $pdo->exec("CREATE TABLE IF NOT EXISTS customer_clients (
        id VARCHAR(80) PRIMARY KEY,
        token_hash VARCHAR(128) NOT NULL,
        contact_name VARCHAR(180) NOT NULL DEFAULT '',
        email VARCHAR(180) NOT NULL DEFAULT '',
        phone VARCHAR(40) NOT NULL DEFAULT '',
        source VARCHAR(80) NOT NULL DEFAULT '',
        thread_id VARCHAR(80) NOT NULL DEFAULT '',
        claim_stage VARCHAR(80) NOT NULL DEFAULT 'intake',
        status VARCHAR(40) NOT NULL DEFAULT 'active',
        profile_json LONGTEXT NOT NULL,
        created_at DATETIME NOT NULL,
        updated_at DATETIME NOT NULL,
        INDEX email_idx (email),
        INDEX phone_idx (phone)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4");

    $pdo->exec("CREATE TABLE IF NOT EXISTS customer_intakes (
        id VARCHAR(80) PRIMARY KEY,
        client_id VARCHAR(80) NOT NULL,
        payload_json LONGTEXT NOT NULL,
        created_at DATETIME NOT NULL,
        INDEX client_idx (client_id)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4");

    $pdo->exec("CREATE TABLE IF NOT EXISTS customer_documents (
        id VARCHAR(80) PRIMARY KEY,
        client_id VARCHAR(80) NOT NULL,
        title VARCHAR(240) NOT NULL,
        category VARCHAR(80) NOT NULL,
        original_filename VARCHAR(240) NOT NULL,
        stored_filename VARCHAR(260) NOT NULL,
        mime_type VARCHAR(120) NOT NULL,
        size_bytes INT NOT NULL,
        source VARCHAR(80) NOT NULL DEFAULT '',
        created_at DATETIME NOT NULL,
        INDEX client_idx (client_id)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4");

    $pdo->exec("CREATE TABLE IF NOT EXISTS customer_tasks (
        id VARCHAR(80) PRIMARY KEY,
        client_id VARCHAR(80) NOT NULL,
        title VARCHAR(240) NOT NULL,
        detail TEXT NOT NULL,
        status VARCHAR(40) NOT NULL DEFAULT 'open',
        due_at VARCHAR(40) NOT NULL DEFAULT '',
        created_at DATETIME NOT NULL,
        updated_at DATETIME NOT NULL,
        INDEX client_idx (client_id)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4");

    $pdo->exec("CREATE TABLE IF NOT EXISTS customer_forms (
        id VARCHAR(80) PRIMARY KEY,
        client_id VARCHAR(80) NOT NULL,
        form_number VARCHAR(40) NOT NULL,
        revision_date VARCHAR(80) NOT NULL,
        source_url VARCHAR(400) NOT NULL,
        status VARCHAR(40) NOT NULL DEFAULT 'draft',
        payload_json LONGTEXT NOT NULL,
        created_at DATETIME NOT NULL,
        INDEX client_idx (client_id)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4");

    $pdo->exec("CREATE TABLE IF NOT EXISTS customer_audit_events (
        id VARCHAR(80) PRIMARY KEY,
        client_id VARCHAR(80) NOT NULL DEFAULT '',
        event_type VARCHAR(80) NOT NULL,
        actor VARCHAR(80) NOT NULL DEFAULT '',
        payload_json LONGTEXT NOT NULL,
        created_at DATETIME NOT NULL,
        INDEX client_idx (client_id)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4");

    $done = true;
}

function crm_pdo(): ?PDO
{
    $pdo = tyfys_db();
    crm_ensure_schema($pdo);
    return $pdo;
}

function crm_is_admin(): bool
{
    $token = crm_admin_session_token();
    if ($token === '') {
        return false;
    }

    $hash = crm_admin_session_hash($token);
    $pdo = crm_pdo();
    if ($pdo) {
        $stmt = $pdo->prepare('SELECT expires_at FROM customer_admin_sessions WHERE token_hash = ?');
        $stmt->execute([$hash]);
        $record = $stmt->fetch();
        if (!$record) {
            return false;
        }
        if ((int)$record['expires_at'] < time()) {
            $pdo->prepare('DELETE FROM customer_admin_sessions WHERE token_hash = ?')->execute([$hash]);
            return false;
        }
        return true;
    }

    $sessions = tyfys_read_json_file(tyfys_data_file('customer-admin-sessions.json'));
    $records = is_array($sessions['sessions'] ?? null) ? $sessions['sessions'] : [];
    $record = $records[$hash] ?? null;
    return is_array($record) && (int)($record['expiresAt'] ?? 0) >= time();
}

function crm_require_admin(): void
{
    if (!crm_is_admin()) {
        crm_json(401, ['ok' => false, 'authenticated' => false, 'error' => 'login_required']);
    }
}

function crm_id(string $prefix): string
{
    return $prefix . '_' . bin2hex(random_bytes(12));
}

function crm_token_hash(string $token): string
{
    return hash('sha256', $token . ':' . crm_secret());
}

function crm_json_encode(array $payload): string
{
    $json = json_encode($payload, JSON_UNESCAPED_SLASHES);
    return is_string($json) ? $json : '{}';
}

function crm_decode_json_field($value): array
{
    if (!is_string($value) || trim($value) === '') {
        return [];
    }
    $decoded = json_decode($value, true);
    return is_array($decoded) ? $decoded : [];
}

function crm_store_path(): string
{
    return tyfys_data_file('customer-crm.json');
}

function crm_file_store(): array
{
    $store = tyfys_read_json_file(crm_store_path());
    foreach (['clients', 'intakes', 'documents', 'tasks', 'forms', 'auditEvents'] as $key) {
        if (!is_array($store[$key] ?? null)) {
            $store[$key] = [];
        }
    }
    return $store;
}

function crm_write_file_store(array $store): bool
{
    return tyfys_write_json_file(crm_store_path(), $store);
}

function crm_clean_contact(array $payload): array
{
    $contact = is_array($payload['contact'] ?? null) ? $payload['contact'] : $payload;
    $email = strtolower(tyfys_safe_string($contact['email'] ?? $contact['contactEmail'] ?? '', 180));
    if ($email !== '' && filter_var($email, FILTER_VALIDATE_EMAIL) === false) {
        $email = '';
    }
    return [
        'name' => tyfys_safe_string($contact['name'] ?? $contact['contactName'] ?? '', 180),
        'email' => $email,
        'phone' => tyfys_normalize_phone_e164(tyfys_safe_string($contact['phone'] ?? $contact['contactPhone'] ?? '', 80)),
        'source' => tyfys_safe_string($payload['source'] ?? $contact['source'] ?? 'ios-va-doc-finder', 80),
    ];
}

function crm_public_client(array $row): array
{
    return [
        'id' => tyfys_safe_string($row['id'] ?? '', 80),
        'contact' => [
            'name' => tyfys_safe_string($row['contact_name'] ?? $row['contact']['name'] ?? '', 180),
            'email' => tyfys_safe_string($row['email'] ?? $row['contact']['email'] ?? '', 180),
            'phone' => tyfys_safe_string($row['phone'] ?? $row['contact']['phone'] ?? '', 40),
            'source' => tyfys_safe_string($row['source'] ?? $row['contact']['source'] ?? '', 80),
        ],
        'threadId' => tyfys_safe_string($row['thread_id'] ?? $row['threadId'] ?? '', 80),
        'claimStage' => tyfys_safe_string($row['claim_stage'] ?? $row['claimStage'] ?? 'intake', 80),
        'status' => tyfys_safe_string($row['status'] ?? 'active', 40),
        'profile' => is_array($row['profile'] ?? null) ? $row['profile'] : crm_decode_json_field($row['profile_json'] ?? ''),
        'createdAt' => tyfys_safe_string($row['created_at'] ?? $row['createdAt'] ?? '', 60),
        'updatedAt' => tyfys_safe_string($row['updated_at'] ?? $row['updatedAt'] ?? '', 60),
    ];
}

function crm_find_client_token_hash(string $clientId): string
{
    $pdo = crm_pdo();
    if ($pdo) {
        $stmt = $pdo->prepare('SELECT token_hash FROM customer_clients WHERE id = ?');
        $stmt->execute([$clientId]);
        $record = $stmt->fetch();
        return is_array($record) ? tyfys_safe_string($record['token_hash'] ?? '', 128) : '';
    }

    $store = crm_file_store();
    $client = $store['clients'][$clientId] ?? null;
    return is_array($client) ? tyfys_safe_string($client['tokenHash'] ?? '', 128) : '';
}

function crm_client_token_ok(string $clientId, string $clientToken): bool
{
    if ($clientId === '' || $clientToken === '') {
        return false;
    }
    $expected = crm_find_client_token_hash($clientId);
    return $expected !== '' && hash_equals($expected, crm_token_hash($clientToken));
}

function crm_request_client_token(): string
{
    // Prefer the header (kept out of access logs); fall back to the query
    // param for older app builds that still send it in the URL.
    $header = $_SERVER['HTTP_X_CLIENT_TOKEN'] ?? '';
    if ($header !== '') {
        return tyfys_safe_string($header, 160);
    }
    return tyfys_safe_string($_GET['clientToken'] ?? '', 160);
}

function crm_require_client_or_admin(string $clientId, string $clientToken): void
{
    if (crm_is_admin() || crm_client_token_ok($clientId, $clientToken)) {
        return;
    }
    crm_json(401, ['ok' => false, 'error' => 'client_token_required']);
}

function crm_audit(string $eventType, string $clientId = '', array $payload = [], string $actor = ''): void
{
    $event = [
        'id' => crm_id('audit'),
        'client_id' => $clientId,
        'event_type' => $eventType,
        'actor' => $actor,
        'payload_json' => crm_json_encode($payload),
        'created_at' => tyfys_iso_now(),
    ];

    $pdo = crm_pdo();
    if ($pdo) {
        $stmt = $pdo->prepare('INSERT INTO customer_audit_events (id, client_id, event_type, actor, payload_json, created_at) VALUES (?, ?, ?, ?, ?, ?)');
        $stmt->execute([$event['id'], $clientId, $eventType, $actor, $event['payload_json'], $event['created_at']]);
        return;
    }

    $store = crm_file_store();
    $store['auditEvents'][$event['id']] = [
        'id' => $event['id'],
        'clientId' => $clientId,
        'eventType' => $eventType,
        'actor' => $actor,
        'payload' => $payload,
        'createdAt' => $event['created_at'],
    ];
    crm_write_file_store($store);
}

function crm_find_client_public(string $clientId): array
{
    if ($clientId === '') {
        return [];
    }

    $pdo = crm_pdo();
    if ($pdo) {
        $stmt = $pdo->prepare('SELECT * FROM customer_clients WHERE id = ?');
        $stmt->execute([$clientId]);
        $record = $stmt->fetch();
        return is_array($record) ? crm_public_client($record) : [];
    }

    $client = crm_file_store()['clients'][$clientId] ?? null;
    return is_array($client) ? crm_public_client($client) : [];
}

function crm_sync_client_to_zoho(array $client, string $eventType, array $eventPayload = []): array
{
    if (!$client) {
        return ['ok' => false, 'skipped' => true, 'reason' => 'client_not_found'];
    }

    $contact = is_array($client['contact'] ?? null) ? $client['contact'] : [];
    $profile = is_array($client['profile'] ?? null) ? $client['profile'] : [];
    $profile = array_merge($profile, [
        'firstName' => $profile['firstName'] ?? '',
        'lastName' => $profile['lastName'] ?? '',
        'email' => $profile['email'] ?? ($contact['email'] ?? ''),
        'phone' => $profile['phone'] ?? ($contact['phone'] ?? ''),
    ]);

    try {
        return tyfys_customer_sync_upsert_customer([
            'action' => $eventType,
            'event' => $eventType,
            'source' => 'customer_portal',
            'userId' => $client['id'] ?? '',
            'profile' => $profile,
            'contact' => $contact,
            'stateSummary' => array_merge([
                'customerPortalClientId' => $client['id'] ?? '',
                'claimStage' => $client['claimStage'] ?? '',
                'portalStatus' => $client['status'] ?? '',
            ], tyfys_customer_sync_redact($eventPayload)),
            'preserveLead' => false,
        ], 'TYFYS customer portal sync', [
            'Customer Portal Event: ' . $eventType,
        ]);
    } catch (Throwable $error) {
        $message = tyfys_safe_string($error->getMessage(), 500);
        tyfys_append_log('customer-sync-errors-' . gmdate('Y-m-d') . '.jsonl', [
            'event' => 'customer_portal_sync_failed',
            'eventType' => $eventType,
            'clientId' => $client['id'] ?? '',
            'at' => tyfys_iso_now(),
            'message' => $message,
        ]);
        return ['ok' => false, 'error' => $message];
    }
}

function crm_forms_catalog(): array
{
    $checked = gmdate('Y-m-d');
    $forms = [
        ['formNumber' => '21-526EZ', 'name' => 'Application for Disability Compensation and Related Compensation Benefits', 'category' => 'Disability', 'revisionDate' => 'January 2026', 'sourceURL' => 'https://www.va.gov/forms/21-526ez/', 'pdfURL' => 'https://www.vba.va.gov/pubs/forms/VBA-21-526EZ-ARE.pdf', 'onlineToolURL' => 'https://www.va.gov/disability/file-disability-claim-form-21-526ez/', 'autofillStatus' => 'catalogOnly'],
        ['formNumber' => '20-0995', 'name' => 'Decision Review Request: Supplemental Claim', 'category' => 'Decision reviews and appeals', 'revisionDate' => 'May 2024', 'sourceURL' => 'https://www.va.gov/forms/20-0995/', 'pdfURL' => 'https://www.vba.va.gov/pubs/forms/VBA-20-0995-ARE.pdf', 'onlineToolURL' => 'https://www.va.gov/decision-reviews/supplemental-claim/file-supplemental-claim-form-20-0995/', 'autofillStatus' => 'catalogOnly'],
        ['formNumber' => '20-0996', 'name' => 'Decision Review Request: Higher-Level Review', 'category' => 'Decision reviews and appeals', 'revisionDate' => 'March 2024', 'sourceURL' => 'https://www.va.gov/forms/20-0996/', 'pdfURL' => 'https://www.vba.va.gov/pubs/forms/VBA-20-0996-ARE.pdf', 'onlineToolURL' => '', 'autofillStatus' => 'catalogOnly'],
        ['formNumber' => '21-0966', 'name' => 'Intent to File a Claim for Compensation and/or Pension, or Survivors Pension and/or DIC', 'category' => 'Disability', 'revisionDate' => 'February 2023', 'sourceURL' => 'https://www.va.gov/forms/21-0966/', 'pdfURL' => 'https://www.vba.va.gov/pubs/forms/VBA-21-0966-ARE.pdf', 'onlineToolURL' => '', 'autofillStatus' => 'catalogOnly'],
        ['formNumber' => '21-4138', 'name' => 'Statement in Support of Claim', 'category' => 'Disability', 'revisionDate' => 'July 2024', 'sourceURL' => 'https://www.va.gov/forms/21-4138/', 'pdfURL' => 'https://www.vba.va.gov/pubs/forms/VBA-21-4138-ARE.pdf', 'onlineToolURL' => '', 'autofillStatus' => 'catalogOnly'],
        ['formNumber' => '21-10210', 'name' => 'Lay/Witness Statement', 'category' => 'VBA', 'revisionDate' => 'June 2021', 'sourceURL' => 'https://www.va.gov/forms/21-10210/', 'pdfURL' => 'https://www.vba.va.gov/pubs/forms/VBA-21-10210-ARE.pdf', 'onlineToolURL' => '', 'autofillStatus' => 'catalogOnly'],
        ['formNumber' => '21-0781', 'name' => 'Statement in Support of Claimed Mental Health Disorder(s) Due to an In-Service Traumatic Event(s)', 'category' => 'Disability', 'revisionDate' => 'March 2024', 'sourceURL' => 'https://www.va.gov/forms/21-0781/', 'pdfURL' => 'https://www.vba.va.gov/pubs/forms/VBA-21-0781-ARE.pdf', 'onlineToolURL' => '', 'autofillStatus' => 'catalogOnly'],
        ['formNumber' => '21-4142', 'name' => 'Authorization to Disclose Information to the Department of Veterans Affairs', 'category' => 'Disability, Health care', 'revisionDate' => 'August 2024', 'sourceURL' => 'https://www.va.gov/forms/21-4142/', 'pdfURL' => 'https://www.vba.va.gov/pubs/forms/VBA-21-4142-ARE.pdf', 'onlineToolURL' => '', 'autofillStatus' => 'catalogOnly'],
        ['formNumber' => '21-4142a', 'name' => 'General Release for Medical Provider Information to the Department of Veterans Affairs', 'category' => 'Disability, Health care', 'revisionDate' => 'August 2024', 'sourceURL' => 'https://www.va.gov/forms/21-4142a/', 'pdfURL' => 'https://www.vba.va.gov/pubs/forms/VBA-21-4142a-ARE.pdf', 'onlineToolURL' => '', 'autofillStatus' => 'catalogOnly'],
        ['formNumber' => '20-10206', 'name' => 'Freedom of Information Act (FOIA) or Privacy Act (PA) Request', 'category' => 'VBA', 'revisionDate' => 'August 2023', 'sourceURL' => 'https://www.va.gov/forms/20-10206/', 'pdfURL' => 'https://www.vba.va.gov/pubs/forms/VBA-20-10206-ARE.pdf', 'onlineToolURL' => '', 'autofillStatus' => 'catalogOnly'],
        ['formNumber' => '21-686c', 'name' => 'Application Request to Add and/or Remove Dependents', 'category' => 'Disability, Family member benefits, Pension', 'revisionDate' => 'August 2025', 'sourceURL' => 'https://www.va.gov/forms/21-686c/', 'pdfURL' => 'https://www.vba.va.gov/pubs/forms/VBA-21-686c-ARE.pdf', 'onlineToolURL' => '', 'autofillStatus' => 'catalogOnly'],
    ];

    foreach ($forms as &$form) {
        $form['lastCheckedAt'] = $checked;
    }

    return $forms;
}

function crm_upsert_client(array $payload): array
{
    $clientId = tyfys_safe_string($payload['clientId'] ?? '', 80);
    $clientToken = tyfys_safe_string($payload['clientToken'] ?? '', 160);
    $isExisting = $clientId !== '';
    if ($isExisting) {
        crm_require_client_or_admin($clientId, $clientToken);
    } else {
        $clientId = crm_id('client');
        $clientToken = bin2hex(random_bytes(24));
    }

    $contact = crm_clean_contact($payload);
    if (!$isExisting && $contact['email'] === '' && $contact['phone'] === '') {
        crm_json(400, ['ok' => false, 'error' => 'email_or_phone_required']);
    }

    $profile = is_array($payload['profile'] ?? null) ? $payload['profile'] : [];
    unset($profile['customerClientToken'], $profile['customerClientId']);
    // Preserve the staff CRM overlay (stage, owner, notes, …) across app/iOS syncs
    // unless the sync payload explicitly provides its own crm block.
    if ($isExisting && !is_array($profile['crm'] ?? null)) {
        $existingClient = crm_find_client_public($clientId);
        $existingCrm = $existingClient['profile']['crm'] ?? null;
        if (is_array($existingCrm)) {
            $profile['crm'] = $existingCrm;
        }
    }
    $threadId = tyfys_safe_string($payload['threadId'] ?? '', 80);
    $now = tyfys_iso_now();
    $tokenHash = $isExisting ? crm_find_client_token_hash($clientId) : crm_token_hash($clientToken);
    if ($tokenHash === '') {
        $tokenHash = crm_token_hash($clientToken);
    }

    $pdo = crm_pdo();
    if ($pdo) {
        $stmt = $pdo->prepare('SELECT id, created_at FROM customer_clients WHERE id = ?');
        $stmt->execute([$clientId]);
        $existing = $stmt->fetch();
        if ($existing) {
            $stmt = $pdo->prepare('UPDATE customer_clients SET contact_name = ?, email = ?, phone = ?, source = ?, thread_id = ?, profile_json = ?, updated_at = ? WHERE id = ?');
            $stmt->execute([$contact['name'], $contact['email'], $contact['phone'], $contact['source'], $threadId, crm_json_encode($profile), $now, $clientId]);
        } else {
            $stmt = $pdo->prepare('INSERT INTO customer_clients (id, token_hash, contact_name, email, phone, source, thread_id, profile_json, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)');
            $stmt->execute([$clientId, $tokenHash, $contact['name'], $contact['email'], $contact['phone'], $contact['source'], $threadId, crm_json_encode($profile), $now, $now]);
        }
    } else {
        $store = crm_file_store();
        $createdAt = tyfys_safe_string($store['clients'][$clientId]['createdAt'] ?? $now, 60);
        $store['clients'][$clientId] = [
            'id' => $clientId,
            'tokenHash' => $tokenHash,
            'contact' => $contact,
            'threadId' => $threadId,
            'claimStage' => tyfys_safe_string($store['clients'][$clientId]['claimStage'] ?? 'intake', 80),
            'status' => tyfys_safe_string($store['clients'][$clientId]['status'] ?? 'active', 40),
            'profile' => $profile,
            'createdAt' => $createdAt,
            'updatedAt' => $now,
        ];
        crm_write_file_store($store);
    }

    // Strip the bearer token before persisting the intake payload at rest.
    $safeIntakePayload = $payload;
    unset($safeIntakePayload['clientToken']);
    if (isset($safeIntakePayload['profile']) && is_array($safeIntakePayload['profile'])) {
        unset($safeIntakePayload['profile']['customerClientToken'], $safeIntakePayload['profile']['customerClientId']);
    }
    $intake = [
        'id' => crm_id('intake'),
        'clientId' => $clientId,
        'payload' => $safeIntakePayload,
        'createdAt' => $now,
    ];
    $pdo = crm_pdo();
    if ($pdo) {
        $stmt = $pdo->prepare('INSERT INTO customer_intakes (id, client_id, payload_json, created_at) VALUES (?, ?, ?, ?)');
        $stmt->execute([$intake['id'], $clientId, crm_json_encode($safeIntakePayload), $now]);
    } else {
        $store = crm_file_store();
        $store['intakes'][$intake['id']] = $intake;
        crm_write_file_store($store);
    }

    crm_audit('client_sync', $clientId, ['source' => $contact['source'], 'recordCount' => count(is_array($payload['records'] ?? null) ? $payload['records'] : [])], 'ios');
    $crmSync = crm_sync_client_to_zoho(crm_find_client_public($clientId), 'customer_portal_intake', [
        'source' => $contact['source'],
        'recordCount' => count(is_array($payload['records'] ?? null) ? $payload['records'] : []),
    ]);
    return ['ok' => true, 'clientId' => $clientId, 'clientToken' => $clientToken, 'updatedAt' => $now, 'crmSync' => $crmSync];
}

function crm_all_clients(): array
{
    $pdo = crm_pdo();
    if ($pdo) {
        $rows = $pdo->query('SELECT * FROM customer_clients ORDER BY updated_at DESC LIMIT 500')->fetchAll();
        return array_map('crm_public_client', is_array($rows) ? $rows : []);
    }

    $store = crm_file_store();
    $clients = array_values($store['clients']);
    usort($clients, fn($a, $b) => strcmp((string)($b['updatedAt'] ?? ''), (string)($a['updatedAt'] ?? '')));
    return array_map('crm_public_client', $clients);
}

function crm_documents(): array
{
    $pdo = crm_pdo();
    if ($pdo) {
        $rows = $pdo->query('SELECT id, client_id, title, category, original_filename, mime_type, size_bytes, source, created_at FROM customer_documents ORDER BY created_at DESC LIMIT 1000')->fetchAll();
        return is_array($rows) ? array_map(fn($row) => [
            'id' => $row['id'],
            'clientId' => $row['client_id'],
            'title' => $row['title'],
            'category' => $row['category'],
            'originalFilename' => $row['original_filename'],
            'mimeType' => $row['mime_type'],
            'sizeBytes' => (int)$row['size_bytes'],
            'source' => $row['source'],
            'createdAt' => $row['created_at'],
        ], $rows) : [];
    }

    return array_values(crm_file_store()['documents']);
}

function crm_client_documents(string $clientId): array
{
    $pdo = crm_pdo();
    if ($pdo) {
        $stmt = $pdo->prepare('SELECT id, client_id, title, category, original_filename, mime_type, size_bytes, source, created_at FROM customer_documents WHERE client_id = ? ORDER BY created_at DESC LIMIT 500');
        $stmt->execute([$clientId]);
        $rows = $stmt->fetchAll();
        return is_array($rows) ? array_map(fn($row) => [
            'id' => $row['id'],
            'clientId' => $row['client_id'],
            'title' => $row['title'],
            'category' => $row['category'],
            'originalFilename' => $row['original_filename'],
            'mimeType' => $row['mime_type'],
            'sizeBytes' => (int)$row['size_bytes'],
            'source' => $row['source'],
            'createdAt' => $row['created_at'],
        ], $rows) : [];
    }

    $documents = array_values(array_filter(
        crm_file_store()['documents'],
        fn($doc) => (string)($doc['clientId'] ?? $doc['client_id'] ?? '') === $clientId
    ));
    usort($documents, fn($a, $b) => strcmp((string)($b['createdAt'] ?? ''), (string)($a['createdAt'] ?? '')));
    return array_map(fn($doc) => array_diff_key($doc, ['storedFilename' => 1, 'stored_filename' => 1]), $documents);
}

function crm_tasks(): array
{
    $pdo = crm_pdo();
    if ($pdo) {
        $rows = $pdo->query('SELECT * FROM customer_tasks ORDER BY updated_at DESC LIMIT 1000')->fetchAll();
        return is_array($rows) ? array_map(fn($row) => [
            'id' => $row['id'],
            'clientId' => $row['client_id'],
            'title' => $row['title'],
            'detail' => $row['detail'],
            'status' => $row['status'],
            'dueAt' => $row['due_at'],
            'createdAt' => $row['created_at'],
            'updatedAt' => $row['updated_at'],
        ], $rows) : [];
    }

    return array_values(crm_file_store()['tasks']);
}

function crm_forms(): array
{
    $pdo = crm_pdo();
    if ($pdo) {
        $rows = $pdo->query('SELECT * FROM customer_forms ORDER BY created_at DESC LIMIT 1000')->fetchAll();
        return is_array($rows) ? array_map(fn($row) => [
            'id' => $row['id'],
            'clientId' => $row['client_id'],
            'formNumber' => $row['form_number'],
            'revisionDate' => $row['revision_date'],
            'sourceURL' => $row['source_url'],
            'status' => $row['status'],
            'payload' => crm_decode_json_field($row['payload_json']),
            'createdAt' => $row['created_at'],
        ], $rows) : [];
    }

    return array_values(crm_file_store()['forms']);
}

function crm_audit_events(): array
{
    $pdo = crm_pdo();
    if ($pdo) {
        $rows = $pdo->query('SELECT * FROM customer_audit_events ORDER BY created_at DESC LIMIT 500')->fetchAll();
        return is_array($rows) ? array_map(fn($row) => [
            'id' => $row['id'],
            'clientId' => $row['client_id'],
            'eventType' => $row['event_type'],
            'actor' => $row['actor'],
            'payload' => crm_decode_json_field($row['payload_json']),
            'createdAt' => $row['created_at'],
        ], $rows) : [];
    }

    return array_values(crm_file_store()['auditEvents']);
}

function crm_threads(): array
{
    $store = tyfys_read_json_file(tyfys_data_file('customer-conversations.json'));
    $threads = is_array($store['threads'] ?? null) ? array_values($store['threads']) : [];
    usort($threads, fn($a, $b) => strcmp((string)($b['updatedAt'] ?? ''), (string)($a['updatedAt'] ?? '')));
    return $threads;
}

function crm_dashboard(): array
{
    return [
        'ok' => true,
        'authenticated' => true,
        'storage' => crm_pdo() ? 'mysql' : 'file',
        'clients' => crm_all_clients(),
        'threads' => crm_threads(),
        'documents' => crm_documents(),
        'tasks' => crm_tasks(),
        'forms' => crm_forms(),
        'auditEvents' => crm_audit_events(),
        'syncLedger' => tyfys_customer_sync_recent_ledger(100),
        'formsCatalog' => crm_forms_catalog(),
    ];
}

function crm_add_task(array $payload): array
{
    crm_require_admin();
    $clientId = tyfys_safe_string($payload['clientId'] ?? '', 80);
    $title = tyfys_safe_string($payload['title'] ?? '', 240);
    if ($clientId === '' || $title === '') {
        crm_json(400, ['ok' => false, 'error' => 'client_and_title_required']);
    }
    $task = [
        'id' => crm_id('task'),
        'clientId' => $clientId,
        'title' => $title,
        'detail' => tyfys_safe_string($payload['detail'] ?? '', 4000),
        'status' => tyfys_safe_string($payload['status'] ?? 'open', 40),
        'dueAt' => tyfys_safe_string($payload['dueAt'] ?? '', 40),
        'createdAt' => tyfys_iso_now(),
        'updatedAt' => tyfys_iso_now(),
    ];

    $pdo = crm_pdo();
    if ($pdo) {
        $stmt = $pdo->prepare('INSERT INTO customer_tasks (id, client_id, title, detail, status, due_at, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)');
        $stmt->execute([$task['id'], $clientId, $task['title'], $task['detail'], $task['status'], $task['dueAt'], $task['createdAt'], $task['updatedAt']]);
    } else {
        $store = crm_file_store();
        $store['tasks'][$task['id']] = $task;
        crm_write_file_store($store);
    }
    crm_audit('task_created', $clientId, ['title' => $title], 'staff');
    crm_sync_client_to_zoho(crm_find_client_public($clientId), 'customer_portal_task_created', [
        'taskId' => $task['id'],
        'title' => $task['title'],
        'status' => $task['status'],
        'dueAt' => $task['dueAt'],
    ]);
    return crm_dashboard();
}

function crm_safe_upload_extension(string $filename, string $mime): string
{
    $ext = strtolower(pathinfo($filename, PATHINFO_EXTENSION));
    $allowed = ['pdf', 'png', 'jpg', 'jpeg', 'txt'];
    if (in_array($ext, $allowed, true)) {
        return $ext === 'jpeg' ? 'jpg' : $ext;
    }
    switch ($mime) {
        case 'application/pdf':
            return 'pdf';
        case 'image/png':
            return 'png';
        case 'image/jpeg':
            return 'jpg';
        case 'text/plain':
            return 'txt';
        default:
            return '';
    }
}

function crm_upload_document(string $clientId, array $payload): array
{
    $clientToken = tyfys_safe_string($_POST['clientToken'] ?? $payload['clientToken'] ?? '', 160);
    crm_require_client_or_admin($clientId, $clientToken);
    if (!isset($_FILES['document']) || !is_array($_FILES['document'])) {
        crm_json(400, ['ok' => false, 'error' => 'document_required']);
    }
    $file = $_FILES['document'];
    if ((int)($file['error'] ?? UPLOAD_ERR_NO_FILE) !== UPLOAD_ERR_OK) {
        crm_json(400, ['ok' => false, 'error' => 'upload_failed']);
    }
    if ((int)($file['size'] ?? 0) > 15728640) {
        crm_json(413, ['ok' => false, 'error' => 'document_too_large']);
    }

    $tmp = (string)($file['tmp_name'] ?? '');
    $original = tyfys_safe_string($file['name'] ?? 'record.pdf', 240);
    $mime = tyfys_safe_string($file['type'] ?? 'application/octet-stream', 120);
    $ext = crm_safe_upload_extension($original, $mime);
    if ($tmp === '' || $ext === '') {
        crm_json(400, ['ok' => false, 'error' => 'unsupported_document_type']);
    }

    $documentId = crm_id('doc');
    $dir = tyfys_data_file('customer-documents/' . preg_replace('/[^a-zA-Z0-9_-]+/', '', $clientId));
    if (!is_dir($dir)) {
        @mkdir($dir, 0775, true);
    }
    $stored = $documentId . '.' . $ext;
    $destination = $dir . '/' . $stored;
    if (!move_uploaded_file($tmp, $destination)) {
        crm_json(500, ['ok' => false, 'error' => 'document_store_failed']);
    }

    $metadata = json_decode((string)($_POST['metadata'] ?? '{}'), true);
    $metadata = is_array($metadata) ? $metadata : [];
    $record = [
        'id' => $documentId,
        'clientId' => $clientId,
        'title' => tyfys_safe_string($metadata['title'] ?? pathinfo($original, PATHINFO_FILENAME), 240),
        'category' => tyfys_safe_string($metadata['category'] ?? 'Evidence', 80),
        'originalFilename' => $original,
        'storedFilename' => $stored,
        'mimeType' => $mime,
        'sizeBytes' => (int)($file['size'] ?? 0),
        'source' => tyfys_safe_string($metadata['source'] ?? 'ios-va-doc-finder', 80),
        'createdAt' => tyfys_iso_now(),
    ];

    $pdo = crm_pdo();
    if ($pdo) {
        $stmt = $pdo->prepare('INSERT INTO customer_documents (id, client_id, title, category, original_filename, stored_filename, mime_type, size_bytes, source, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)');
        $stmt->execute([$record['id'], $clientId, $record['title'], $record['category'], $record['originalFilename'], $record['storedFilename'], $record['mimeType'], $record['sizeBytes'], $record['source'], $record['createdAt']]);
    } else {
        $store = crm_file_store();
        $store['documents'][$documentId] = $record;
        crm_write_file_store($store);
    }
    crm_audit('document_uploaded', $clientId, ['documentId' => $documentId, 'title' => $record['title']], 'ios');
    crm_sync_client_to_zoho(crm_find_client_public($clientId), 'customer_portal_document_uploaded', [
        'documentId' => $documentId,
        'title' => $record['title'],
        'category' => $record['category'],
        'mimeType' => $record['mimeType'],
        'sizeBytes' => $record['sizeBytes'],
    ]);
    return ['ok' => true, 'document' => $record];
}

function crm_download_document(string $clientId, string $documentId, string $clientToken = ''): void
{
    // Clients may download their own documents with their portal token;
    // anything else still requires staff/admin auth.
    if ($clientToken === '' || !crm_client_token_ok($clientId, $clientToken)) {
        crm_require_admin();
    }
    $document = null;
    $pdo = crm_pdo();
    if ($pdo) {
        $stmt = $pdo->prepare('SELECT * FROM customer_documents WHERE id = ? AND client_id = ?');
        $stmt->execute([$documentId, $clientId]);
        $document = $stmt->fetch();
    } else {
        $document = crm_file_store()['documents'][$documentId] ?? null;
    }
    if (!is_array($document)) {
        crm_json(404, ['ok' => false, 'error' => 'document_not_found']);
    }
    // Enforce ownership on the file-store path (the SQL path scopes by
    // client_id in the query; the file store must match it explicitly).
    if ((string)($document['clientId'] ?? $document['client_id'] ?? '') !== $clientId) {
        crm_json(404, ['ok' => false, 'error' => 'document_not_found']);
    }

    $stored = tyfys_safe_string($document['stored_filename'] ?? $document['storedFilename'] ?? '', 260);
    $safeClient = preg_replace('/[^a-zA-Z0-9_-]+/', '', $clientId);
    $path = tyfys_data_file('customer-documents/' . $safeClient . '/' . $stored);
    if ($stored === '' || !is_file($path)) {
        crm_json(404, ['ok' => false, 'error' => 'document_file_not_found']);
    }

    crm_audit('document_downloaded', $clientId, ['documentId' => $documentId], 'staff');
    header('Content-Type: ' . tyfys_safe_string($document['mime_type'] ?? $document['mimeType'] ?? 'application/octet-stream', 120));
    header('Content-Length: ' . filesize($path));
    header('Content-Disposition: attachment; filename="' . basename(tyfys_safe_string($document['original_filename'] ?? $document['originalFilename'] ?? $stored, 240)) . '"');
    readfile($path);
    exit;
}

function crm_record_generated_form(array $payload): array
{
    $clientId = tyfys_safe_string($payload['clientId'] ?? '', 80);
    $clientToken = tyfys_safe_string($payload['clientToken'] ?? '', 160);
    if ($clientId !== '') {
        crm_require_client_or_admin($clientId, $clientToken);
    }

    // Never persist the client's bearer token in the stored payload.
    $safePayload = $payload;
    unset($safePayload['clientToken'], $safePayload['clientId']);
    $form = [
        'id' => crm_id('form'),
        'clientId' => $clientId,
        'formNumber' => tyfys_safe_string($payload['formNumber'] ?? '', 40),
        'revisionDate' => tyfys_safe_string($payload['revisionDate'] ?? '', 80),
        'sourceURL' => tyfys_safe_string($payload['sourceURL'] ?? '', 400),
        'status' => tyfys_safe_string($payload['status'] ?? 'draft', 40),
        'payload' => $safePayload,
        'createdAt' => tyfys_iso_now(),
    ];
    if ($form['formNumber'] === '') {
        crm_json(400, ['ok' => false, 'error' => 'form_number_required']);
    }

    $pdo = crm_pdo();
    if ($pdo) {
        $stmt = $pdo->prepare('INSERT INTO customer_forms (id, client_id, form_number, revision_date, source_url, status, payload_json, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)');
        $stmt->execute([$form['id'], $clientId, $form['formNumber'], $form['revisionDate'], $form['sourceURL'], $form['status'], crm_json_encode($safePayload), $form['createdAt']]);
    } else {
        $store = crm_file_store();
        $store['forms'][$form['id']] = $form;
        crm_write_file_store($store);
    }
    crm_audit('form_generated', $clientId, ['formNumber' => $form['formNumber']], $clientId === '' ? 'staff' : 'ios');
    if ($clientId !== '') {
        crm_sync_client_to_zoho(crm_find_client_public($clientId), 'customer_portal_form_generated', [
            'formId' => $form['id'],
            'formNumber' => $form['formNumber'],
            'revisionDate' => $form['revisionDate'],
            'status' => $form['status'],
        ]);
    }
    return ['ok' => true, 'form' => $form];
}

function crm_sanitize_string_list($value, int $max = 40, int $length = 160): array
{
    if (!is_array($value)) {
        return [];
    }
    $items = [];
    foreach ($value as $entry) {
        if (is_string($entry) || is_numeric($entry)) {
            $clean = tyfys_safe_string((string)$entry, $length);
            if ($clean !== '') {
                $items[] = $clean;
            }
        }
        if (count($items) >= $max) {
            break;
        }
    }
    return $items;
}

function crm_sanitize_crm_tasks($value): array
{
    if (!is_array($value)) {
        return [];
    }
    $tasks = [];
    foreach ($value as $entry) {
        if (!is_array($entry)) {
            continue;
        }
        $label = tyfys_safe_string($entry['label'] ?? $entry['title'] ?? '', 240);
        if ($label === '') {
            continue;
        }
        $tasks[] = [
            'id' => tyfys_safe_string($entry['id'] ?? '', 80),
            'label' => $label,
            'done' => (bool)($entry['done'] ?? false),
            'completedAt' => tyfys_safe_string($entry['completedAt'] ?? '', 60),
        ];
        if (count($tasks) >= 60) {
            break;
        }
    }
    return $tasks;
}

function crm_sanitize_crm_notes($value): array
{
    if (!is_array($value)) {
        return [];
    }
    $notes = [];
    foreach ($value as $entry) {
        if (!is_array($entry)) {
            continue;
        }
        $text = tyfys_safe_string($entry['text'] ?? '', 4000);
        if ($text === '') {
            continue;
        }
        $notes[] = [
            'id' => tyfys_safe_string($entry['id'] ?? crm_id('note'), 80),
            'text' => $text,
            'author' => tyfys_safe_string($entry['author'] ?? 'staff', 160),
            'createdAt' => tyfys_safe_string($entry['createdAt'] ?? tyfys_iso_now(), 60),
        ];
    }
    return array_slice($notes, -40);
}

function crm_update_client_crm(array $payload): array
{
    crm_require_admin();
    $clientId = tyfys_safe_string($payload['userId'] ?? $payload['clientId'] ?? '', 80);
    if ($clientId === '') {
        crm_json(400, ['ok' => false, 'error' => 'client_id_required']);
    }

    $client = crm_find_client_public($clientId);
    if (!is_array($client) || ($client['id'] ?? '') === '') {
        crm_json(404, ['ok' => false, 'error' => 'client_not_found']);
    }

    $profile = is_array($client['profile'] ?? null) ? $client['profile'] : [];
    $crm = is_array($profile['crm'] ?? null) ? $profile['crm'] : [];
    $now = tyfys_iso_now();

    foreach (['stage', 'owner', 'priority', 'status', 'nextStep', 'dueAt', 'lastContactAt'] as $field) {
        if (array_key_exists($field, $payload)) {
            $crm[$field] = tyfys_safe_string((string)($payload[$field] ?? ''), 240);
        }
    }
    if (array_key_exists('tags', $payload)) {
        $crm['tags'] = crm_sanitize_string_list($payload['tags']);
    }
    if (array_key_exists('blockers', $payload)) {
        $crm['blockers'] = crm_sanitize_string_list($payload['blockers'], 40, 240);
    }
    if (array_key_exists('tasks', $payload)) {
        $crm['tasks'] = crm_sanitize_crm_tasks($payload['tasks']);
    }

    $notes = crm_sanitize_crm_notes($crm['notes'] ?? []);
    $addNote = tyfys_safe_string($payload['addNote'] ?? '', 4000);
    if ($addNote !== '') {
        $notes[] = [
            'id' => crm_id('note'),
            'text' => $addNote,
            'author' => 'staff',
            'createdAt' => $now,
        ];
        if (($crm['lastContactAt'] ?? '') === '') {
            $crm['lastContactAt'] = $now;
        }
    }
    $crm['notes'] = array_slice($notes, -40);
    $crm['updatedAt'] = $now;
    $crm['updatedBy'] = 'staff';

    $profile['crm'] = $crm;

    $pdo = crm_pdo();
    if ($pdo) {
        $stmt = $pdo->prepare('UPDATE customer_clients SET profile_json = ?, updated_at = ? WHERE id = ?');
        $stmt->execute([crm_json_encode($profile), $now, $clientId]);
    } else {
        $store = crm_file_store();
        if (!is_array($store['clients'][$clientId] ?? null)) {
            crm_json(404, ['ok' => false, 'error' => 'client_not_found']);
        }
        $store['clients'][$clientId]['profile'] = $profile;
        $store['clients'][$clientId]['updatedAt'] = $now;
        crm_write_file_store($store);
    }

    crm_audit('crm_update', $clientId, [
        'stage' => $crm['stage'] ?? '',
        'owner' => $crm['owner'] ?? '',
        'noteAdded' => $addNote !== '',
    ], 'staff');

    return ['ok' => true, 'client' => crm_find_client_public($clientId), 'updatedAt' => $now];
}

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    $headers = crm_headers();
    $headers['Access-Control-Allow-Methods'] = 'GET, POST, OPTIONS';
    $headers['Access-Control-Allow-Headers'] = 'Content-Type';
    tyfys_json_response(204, ['ok' => true], $headers);
}

$resource = tyfys_safe_string($_GET['resource'] ?? '', 80);
if ($resource === '') {
    $resource = 'dashboard';
}

if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    if ($resource === 'forms_catalog') {
        crm_json(200, ['ok' => true, 'forms' => crm_forms_catalog()]);
    }
    if ($resource === 'document_download') {
        crm_download_document(
            tyfys_safe_string($_GET['clientId'] ?? '', 80),
            tyfys_safe_string($_GET['documentId'] ?? '', 80),
            crm_request_client_token()
        );
    }
    if ($resource === 'documents_list') {
        $clientId = tyfys_safe_string($_GET['clientId'] ?? '', 80);
        crm_require_client_or_admin($clientId, crm_request_client_token());
        crm_json(200, ['ok' => true, 'documents' => crm_client_documents($clientId)]);
    }
    crm_require_admin();
    if ($resource === 'clients') {
        crm_json(200, ['ok' => true, 'authenticated' => true, 'clients' => crm_all_clients()]);
    }
    crm_json(200, crm_dashboard());
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    crm_json(405, ['ok' => false, 'error' => 'method_not_allowed']);
}

if ($resource === 'documents') {
    crm_json(200, crm_upload_document(tyfys_safe_string($_GET['clientId'] ?? '', 80), []));
}

$payload = tyfys_body_json();
$action = tyfys_safe_string($payload['action'] ?? $resource, 80);

if (in_array($action, ['sync_workspace', 'clients', 'intake'], true)) {
    crm_json(200, crm_upsert_client($payload));
}

if (in_array($action, ['tasks', 'task'], true)) {
    crm_json(200, crm_add_task($payload));
}

if (in_array($action, ['crm_update', 'update_crm'], true)) {
    crm_json(200, crm_update_client_crm($payload));
}

if (in_array($action, ['forms_generate', 'generate_form'], true)) {
    crm_json(200, crm_record_generated_form($payload));
}

if (in_array($action, ['audit_events', 'audit'], true)) {
    $clientId = tyfys_safe_string($payload['clientId'] ?? '', 80);
    if ($clientId !== '') {
        crm_require_client_or_admin($clientId, tyfys_safe_string($payload['clientToken'] ?? '', 160));
    } else {
        crm_require_admin();
    }
    crm_audit(tyfys_safe_string($payload['eventType'] ?? 'custom', 80), $clientId, is_array($payload['payload'] ?? null) ? $payload['payload'] : [], tyfys_safe_string($payload['actor'] ?? 'ios', 80));
    crm_json(200, ['ok' => true]);
}

crm_json(400, ['ok' => false, 'error' => 'unknown_action']);
