
# install minikube
curl -LO https://github.com/kubernetes/minikube/releases/latest/download/minikube-linux-amd64
sudo install minikube-linux-amd64 /usr/local/bin/minikube && rm minikube-linux-amd64

# install Kubectl
# # Download the latest release of kubectl
curl -LO "https://dl.k8s.io/release/$(curl -L -s https://dl.k8s.io/release/stable.txt)/bin/linux/amd64/kubectl"
# # Verify the kubectl binary (optional but recommended)
curl -LO "https://dl.k8s.io/release/$(curl -L -s https://dl.k8s.io/release/stable.txt)/bin/linux/amd64/kubectl.sha256"
echo "$(cat kubectl.sha256)  kubectl" | sha256sum --check

# complete install
sudo install -o root -g root -m 0755 kubectl /usr/local/bin/kubectl


# Start your minikube instance
minikube start

# Install Tekton Pipelines
kubectl apply --filename https://infra.tekton.dev/tekton-releases/pipeline/latest/release.yaml

# watch
kubectl get pods --namespace tekton-pipelines --watch