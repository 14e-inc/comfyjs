# WARP_KEY=""

curl -fsSL https://pkg.cloudflareclient.com/pubkey.gpg | sudo gpg --yes --dearmor -o /usr/share/keyrings/cloudflare-warp-archive-keyring.gpg && \
echo "deb [signed-by=/usr/share/keyrings/cloudflare-warp-archive-keyring.gpg] https://pkg.cloudflareclient.com/ $(. /etc/os-release && echo "$VERSION_CODENAME") main" | \
sudo tee /etc/apt/sources.list.d/cloudflare-client.list && sudo apt-get update -qq && sudo apt-get install -y -qq cloudflare-warp && \
printf 'net.ipv4.ip_forward = 1\nnet.ipv6.conf.all.forwarding = 1\nnet.ipv6.conf.all.accept_ra = 2\n' | \
sudo tee /etc/sysctl.d/99-zzz-cloudflare-warp-connector.conf && sudo sysctl --system

warp-cli connector new $WARP_KEY && \
warp-cli connect