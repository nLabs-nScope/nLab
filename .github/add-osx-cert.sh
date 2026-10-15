#!/usr/bin/env sh

KEY_CHAIN=build.keychain
CERTIFICATE_P12=certificate.p12

# Delete existing keychain if present to avoid conflicts
security delete-keychain $KEY_CHAIN 2>/dev/null || true

# Recreate the certificate from the secure environment variable
echo "$CERTIFICATE_OSX_APPLICATION" | base64 --decode > $CERTIFICATE_P12

# Create a keychain
security create-keychain -p actions $KEY_CHAIN

# Make the keychain the default so identities are found
security default-keychain -s $KEY_CHAIN

# Unlock the keychain
security unlock-keychain -p actions $KEY_CHAIN

# Import certificate into keychain
security import $CERTIFICATE_P12 -k $KEY_CHAIN -P "$CERTIFICATE_PASSWORD" -T /usr/bin/codesign -A

# Set key partition list for headless codesigning
security set-key-partition-list -S apple-tool:,apple:,codesign: -s -k actions $KEY_CHAIN

# Clean up temp p12 file
rm -f *.p12

