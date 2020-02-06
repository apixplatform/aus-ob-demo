
export APP_NAME=cdr-demo-backend
export APP_VERSION=$(grep version ./package.json | awk '{print $2}' | sed 's/\"//g' | sed 's/,//g')

docker build -t ${APP_NAME}:${APP_VERSION} .
docker tag ${APP_NAME}:${APP_VERSION} 368696334230.dkr.ecr.ap-south-1.amazonaws.com/${APP_NAME}:${APP_VERSION}
docker push 368696334230.dkr.ecr.ap-south-1.amazonaws.com/${APP_NAME}:${APP_VERSION}

helm package --version=${APP_VERSION} --app-version=${APP_VERSION} ${APP_NAME}/
export NAMESPACE=cua
export ENVIRONMENT=cua

if helm ls --namespace ${NAMESPACE} |grep ${APP_NAME}; then
    echo "Release ${APP_NAME} exists, Upgrading !! "
    helm del --purge $APP_NAME
    helm install -n ${APP_NAME} --namespace ${NAMESPACE} -f ${APP_NAME}/env/${ENVIRONMENT}-values.yaml --version ${APP_VERSION} ${APP_NAME}/
    # helm upgrade --namespace ${NAMESPACE} -f ${APP_NAME}/env/${ENVIRONMENT}-values.yaml ${APP_NAME} ${APP_NAME}/
else
    echo "Release ${APP_NAME} not found, Installing!!"
    helm install -n ${APP_NAME} --namespace ${NAMESPACE} -f ${APP_NAME}/env/${ENVIRONMENT}-values.yaml ${APP_NAME}/
fi