#!/bin/bash

# This script will be called on the provisioned VM's to set up the development environment.
# It installs user data for cloud init and auto install

UBUNUTU_2026_LTS_VERSION="24.04"
LIVE_SERVER_VERSION=$UBUNTU_2026_LTS_VERSION
CONFIG_SERVER_DOMAIN="http://_gateway"
CONFIG_SERVER_PORT="3003"
ARCH="amd64"
MEMORY="2048"

kvm_install(){
    kvm -no-reboot -m "${MEMORY}" \
        -drive file=image.img,format=raw,cache=none,if=virtio \
        -cdrom "~/Downloads/ubuntu-${LIVE_SERVER_VERSION}-live-server-${ARCH}.iso" \
        -kernel /mnt/casper/vmlinuz \
        -initrd /mnt/casper/initrd \
        -append "autoinstall ds=nocloud-net;s=${CONFIG_SERVER_DOMAIN}:${CONFIG_SERVER_PORT}/"
}

