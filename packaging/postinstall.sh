#!/bin/sh

RESOURCE_PATH="/usr/lib/nlab/resources/99-nlab.rules"
DEST_PATH="/etc/udev/rules.d/99-nlab.rules"

if [ -f "$RESOURCE_PATH" ]; then
    cp "$RESOURCE_PATH" "$DEST_PATH"
    chmod 644 "$DEST_PATH"
    # Reload udev rules to apply changes immediately
    udevadm control --reload-rules && udevadm trigger
fi