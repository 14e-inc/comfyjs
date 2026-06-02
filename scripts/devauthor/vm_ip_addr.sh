vm_ip_addr() {
    # banking on a coincidence here. This should actually check for any word characters
    for i in $(virsh list | cut -d ' ' -f 6 | grep 0); do
        virsh domifaddr $i
    done

}