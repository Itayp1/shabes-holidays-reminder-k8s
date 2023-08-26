kubernates-yaml --env=qa --name=shabes-holidays-reminder-k8s --operation=deployment --image=itayp/itayp/shabes-holidays-reminder-k8s:83
kubernates-yaml --env=qa --name=shabes-holidays-reminder-k8s --domain=itayp-dev.com --operation=Ingress
kubernates-yaml --env=qa --name=shabes-holidays-reminder-k8s --operation=Service

 
docker build -t itayp/shabes-holidays-reminder-k8s:83 -t itayp/shabes-holidays-reminder-k8s:latest  .
docker push itayp/shabes-holidays-reminder-k8s:83
docker push itayp/shabes-holidays-reminder-k8s:latest

 
kubectl apply -f Deployment.yaml
kubectl apply -f Service.yaml
kubectl apply -f Ingress.yaml