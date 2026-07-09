#!/usr/bin/env node

import { execFileSync } from 'node:child_process'
import fs from 'node:fs/promises'
import path from 'node:path'
import process from 'node:process'

const ROOT = process.cwd()
const IS_WINDOWS = process.platform === 'win32'
const PROJECT_PATH = 'VA Document Finder.xcodeproj'
const SCHEME_NAME = 'VA Document Finder'
const APP_NAME = 'VA Doc Finder by Digital Sync'
const BUNDLE_ID = 'com.digitalsync.vadocumentfinder'
const DEFAULT_TEAM_ID = 'WN3K69XEP4'
const EXPECTED_APPLE_SELLER = 'DIGITAL SYNC, LLC, THE'

function commandName(name) {
  return IS_WINDOWS ? `${name}.cmd` : name
}

function quoteArg(arg) {
  return /\s/.test(arg) ? `"${arg}"` : arg
}

function run(command, args, env, dryRun) {
  console.log(`$ ${command} ${args.map(quoteArg).join(' ')}`)
  if (dryRun) return

  execFileSync(commandName(command), args, {
    cwd: ROOT,
    env,
    stdio: 'inherit',
  })
}

function hasFlag(argv, flag) {
  return argv.includes(flag)
}

function getArgValue(argv, flag) {
  const index = argv.indexOf(flag)
  return index === -1 ? '' : argv[index + 1] || ''
}

function buildExportOptionsPlist({
  bundleId,
  teamId,
  method,
  signingStyle,
  provisioningProfileSpecifier,
  signingCertificate,
  destination,
}) {
  const provisioningProfiles =
    signingStyle === 'manual' && provisioningProfileSpecifier
      ? `
  <key>provisioningProfiles</key>
  <dict>
    <key>${bundleId}</key>
    <string>${provisioningProfileSpecifier}</string>
  </dict>`
      : ''

  const signingCertificateEntry =
    signingStyle === 'manual' && signingCertificate
      ? `
  <key>signingCertificate</key>
  <string>${signingCertificate}</string>`
      : ''

  return `<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
  <key>destination</key>
  <string>${destination}</string>
  <key>manageAppVersionAndBuildNumber</key>
  <false/>
  <key>method</key>
  <string>${method}</string>
  <key>signingStyle</key>
  <string>${signingStyle}</string>${signingCertificateEntry}
  <key>stripSwiftSymbols</key>
  <true/>
  <key>teamID</key>
  <string>${teamId}</string>${provisioningProfiles}
  <key>uploadSymbols</key>
  <true/>
</dict>
</plist>
`
}

function getReleasePaths(marketingVersion, buildNumber) {
  const safeVersion = marketingVersion.replace(/[^0-9A-Za-z._-]/g, '-')
  const safeBuild = buildNumber.replace(/[^0-9A-Za-z._-]/g, '-')
  const base = path.resolve(ROOT, 'output/archives')
  const stem = `VA-Doc-Finder-Digital-Sync-${safeVersion}-${safeBuild}`

  return {
    archivePath: path.resolve(process.env.IOS_ARCHIVE_PATH || path.join(base, `${stem}.xcarchive`)),
    exportPath: path.resolve(process.env.IOS_EXPORT_PATH || path.join(base, `${stem}-export`)),
    uploadPath: path.resolve(process.env.IOS_UPLOAD_PATH || path.join(base, `${stem}-upload`)),
    exportOptionsPath: path.resolve(process.env.IOS_EXPORT_OPTIONS_PATH || path.join(base, `${stem}-exportOptions.plist`)),
    uploadOptionsPath: path.resolve(process.env.IOS_UPLOAD_OPTIONS_PATH || path.join(base, `${stem}-uploadOptions.plist`)),
  }
}

function buildUploadAuthArgs() {
  const apiKey = (process.env.ASC_API_KEY || '').trim()
  const apiIssuer = (process.env.ASC_API_ISSUER || '').trim()
  const p8Path = (process.env.ASC_API_P8_PATH || '').trim()

  if (apiKey && apiIssuer) {
    return [
      '--api-key',
      apiKey,
      '--api-issuer',
      apiIssuer,
      ...(p8Path ? ['--p8-file-path', p8Path] : []),
    ]
  }

  const appleId = (process.env.APPLE_ID || '').trim()
  const password = (process.env.APP_SPECIFIC_PASSWORD || '').trim()
  if (appleId && password) {
    return ['--username', appleId, '--password', '@env:APP_SPECIFIC_PASSWORD']
  }

  return []
}

async function findIpa(exportPath) {
  const entries = await fs.readdir(exportPath)
  const ipa = entries.find((entry) => entry.endsWith('.ipa'))
  if (!ipa) {
    throw new Error(`No .ipa file found in ${exportPath}`)
  }
  return path.join(exportPath, ipa)
}

function assertUploadAllowed(teamId) {
  const expectedSeller = (process.env.DIGITAL_SYNC_EXPECTED_APPLE_SELLER || EXPECTED_APPLE_SELLER).trim()
  const sellerConfirmed = /^true$/i.test((process.env.DIGITAL_SYNC_CONFIRMED_APPLE_SELLER || '').trim())

  if (!/DIGITAL\s+SYNC/i.test(expectedSeller)) {
    throw new Error('Upload blocked: seller/company must reflect Digital Sync for this rebranded app.')
  }

  if (!sellerConfirmed) {
    throw new Error(
      'Upload blocked: set DIGITAL_SYNC_CONFIRMED_APPLE_SELLER=true only after App Store Connect shows the Digital Sync seller.'
    )
  }

  if (!teamId) {
    throw new Error('Upload blocked: missing Apple Developer Team ID.')
  }

  console.log(`Upload allowed for Apple seller: ${expectedSeller}`)
}

async function readProjectVersionDefaults() {
  // project.yml is the source of truth for versions; a stale hardcoded
  // default here previously archived old version numbers silently.
  try {
    const yaml = await fs.readFile(path.join(ROOT, 'project.yml'), 'utf8')
    const marketing = yaml.match(/MARKETING_VERSION:\s*"?([\d.]+)"?/)
    const build = yaml.match(/CURRENT_PROJECT_VERSION:\s*"?(\d+)"?/)
    return {
      marketingVersion: marketing ? marketing[1] : '1.0',
      buildNumber: build ? build[1] : '1',
    }
  } catch {
    return { marketingVersion: '1.0', buildNumber: '1' }
  }
}

async function main() {
  const argv = process.argv.slice(2)
  const dryRun = hasFlag(argv, '--dry-run')
  const shouldUpload = hasFlag(argv, '--upload')
  const explicitTeamId = getArgValue(argv, '--team-id')
  const teamId = (explicitTeamId || process.env.IOS_TEAM_ID || DEFAULT_TEAM_ID).trim()
  const projectDefaults = await readProjectVersionDefaults()
  const marketingVersion = (process.env.IOS_MARKETING_VERSION || projectDefaults.marketingVersion).trim()
  const buildNumber = (process.env.IOS_BUILD_NUMBER || projectDefaults.buildNumber).trim()
  const exportMethod = (process.env.IOS_EXPORT_METHOD || 'app-store-connect').trim()
  const signingStyle = (process.env.IOS_SIGNING_STYLE || 'automatic').trim().toLowerCase()
  const archiveSigningMode = (
    process.env.IOS_ARCHIVE_SIGNING_MODE ||
    (shouldUpload ? 'signed' : signingStyle === 'automatic' ? 'unsigned' : 'signed')
  )
    .trim()
    .toLowerCase()
  const codeSignIdentity = (process.env.IOS_CODE_SIGN_IDENTITY || 'Apple Distribution').trim()
  const provisioningProfileSpecifier = (process.env.IOS_PROVISIONING_PROFILE_SPECIFIER || '').trim()

  if (!['automatic', 'manual'].includes(signingStyle)) {
    throw new Error('IOS_SIGNING_STYLE must be automatic or manual.')
  }
  if (!['signed', 'unsigned'].includes(archiveSigningMode)) {
    throw new Error('IOS_ARCHIVE_SIGNING_MODE must be signed or unsigned.')
  }
  if (signingStyle === 'manual' && !provisioningProfileSpecifier) {
    throw new Error('IOS_PROVISIONING_PROFILE_SPECIFIER is required for manual signing.')
  }
  if (shouldUpload) {
    assertUploadAllowed(teamId)
  }

  const paths = getReleasePaths(marketingVersion, buildNumber)
  const releaseEnv = {
    ...process.env,
    IOS_TEAM_ID: teamId,
    IOS_APP_ID: BUNDLE_ID,
    IOS_APP_NAME: APP_NAME,
    IOS_MARKETING_VERSION: marketingVersion,
    IOS_BUILD_NUMBER: buildNumber,
  }

  console.log(`Preparing iOS App Store release for ${APP_NAME}`)
  console.log(`- Bundle ID: ${BUNDLE_ID}`)
  console.log(`- Version: ${marketingVersion} (${buildNumber})`)
  console.log(`- Team ID: ${teamId}`)
  console.log(`- Archive signing: ${archiveSigningMode}`)
  console.log(`- Export method: ${exportMethod}`)

  await fs.mkdir(path.dirname(paths.archivePath), { recursive: true })

  run('xcodegen', ['generate'], releaseEnv, dryRun)

  run(
    'xcodebuild',
    [
      '-project',
      PROJECT_PATH,
      '-scheme',
      SCHEME_NAME,
      '-configuration',
      'Release',
      '-destination',
      'generic/platform=iOS',
      '-archivePath',
      paths.archivePath,
      '-allowProvisioningUpdates',
      `DEVELOPMENT_TEAM=${teamId}`,
      `MARKETING_VERSION=${marketingVersion}`,
      `CURRENT_PROJECT_VERSION=${buildNumber}`,
      'archive',
      ...(archiveSigningMode === 'unsigned' ? ['CODE_SIGNING_ALLOWED=NO', 'CODE_SIGNING_REQUIRED=NO'] : []),
      ...(archiveSigningMode === 'signed' && signingStyle === 'automatic'
        ? ['CODE_SIGN_STYLE=Automatic', 'PROVISIONING_PROFILE_SPECIFIER=', 'CODE_SIGN_IDENTITY=']
        : []),
      ...(archiveSigningMode === 'signed' && signingStyle === 'manual'
        ? ['CODE_SIGN_STYLE=Manual', `PROVISIONING_PROFILE_SPECIFIER=${provisioningProfileSpecifier}`, `CODE_SIGN_IDENTITY=${codeSignIdentity}`]
        : []),
    ],
    releaseEnv,
    dryRun
  )

  const exportOptions = buildExportOptionsPlist({
    bundleId: BUNDLE_ID,
    teamId,
    method: exportMethod,
    signingStyle,
    provisioningProfileSpecifier,
    signingCertificate: codeSignIdentity,
    destination: 'export',
  })
  const uploadOptions = buildExportOptionsPlist({
    bundleId: BUNDLE_ID,
    teamId,
    method: exportMethod,
    signingStyle,
    provisioningProfileSpecifier,
    signingCertificate: codeSignIdentity,
    destination: 'upload',
  })

  if (dryRun) {
    console.log(`(dry-run) would write ${path.relative(ROOT, paths.exportOptionsPath)}`)
  } else {
    await fs.writeFile(paths.exportOptionsPath, exportOptions, 'utf8')
    console.log(`Wrote export options plist: ${path.relative(ROOT, paths.exportOptionsPath)}`)
  }

  run(
    'xcodebuild',
    [
      '-exportArchive',
      '-archivePath',
      paths.archivePath,
      '-exportOptionsPlist',
      paths.exportOptionsPath,
      '-exportPath',
      paths.exportPath,
      '-allowProvisioningUpdates',
    ],
    releaseEnv,
    dryRun
  )

  if (shouldUpload) {
    const uploadAuthArgs = buildUploadAuthArgs()
    if (uploadAuthArgs.length) {
      const ipaPath = dryRun ? path.join(paths.exportPath, 'VA Document Finder.ipa') : await findIpa(paths.exportPath)
      run(
        'xcrun',
        ['altool', '--upload-app', '-f', ipaPath, '--type', 'ios', '--output-format', 'normal', '--show-progress', ...uploadAuthArgs],
        releaseEnv,
        dryRun
      )
    } else {
      if (dryRun) {
        console.log(`(dry-run) would write ${path.relative(ROOT, paths.uploadOptionsPath)}`)
      } else {
        await fs.writeFile(paths.uploadOptionsPath, uploadOptions, 'utf8')
        console.log(`Wrote upload options plist: ${path.relative(ROOT, paths.uploadOptionsPath)}`)
      }

      run(
        'xcodebuild',
        [
          '-exportArchive',
          '-archivePath',
          paths.archivePath,
          '-exportOptionsPlist',
          paths.uploadOptionsPath,
          '-exportPath',
          paths.uploadPath,
          '-allowProvisioningUpdates',
        ],
        releaseEnv,
        dryRun
      )
    }
  }

  console.log('')
  console.log('iOS release complete:')
  console.log(`- Archive: ${paths.archivePath}`)
  console.log(`- Export: ${paths.exportPath}`)
  if (shouldUpload) {
    console.log(`- Upload staging: ${paths.uploadPath}`)
  }
  console.log(`- Bundle ID: ${BUNDLE_ID}`)
  console.log(`- Version: ${marketingVersion} (${buildNumber})`)
}

main().catch((error) => {
  console.error(`ERROR: ${error.message}`)
  process.exit(1)
})
