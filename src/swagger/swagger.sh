#!/usr/bin/env bash

node src/swagger/swagger.js
swagger_output='src/swagger/swagger-docs.json'

IFS=$'\n'
router=`cat $swagger_output | grep -n "/api/" | awk -F: '{print $1}'`
router_array=($router)
router_array_length=${#router_array[@]}

http_methods="\"get\":\|\"post\":\|\"delete\":\|\"put\":\|\"patch\":"
security="\"security\": [{\"bearerAuth\": []}],"

for ((var=0 ; var < $router_array_length ; var++));
do
	api_tags=`sed -n "${router_array[$var]}p" $swagger_output | awk '{split($1, array, "/"); printf "\"tags\": [\"%s\"],\n", array[3];}'`
	next_var=`expr ${var} + 1`
	if [ $next_var -ge $router_array_length ]; then
		method_array=`sed -n "${router_array[$var]},\'$'p" $swagger_output | grep -n "${http_methods}" | awk -F: '{print $1}'`
	else
		method_array=`sed -n "${router_array[$var]},${router_array[$next_var]}p" $swagger_output | grep -n "${http_methods}" | awk -F: '{print $1}'`
	fi

	for line_num in ${method_array[@]};
	do
		modify_line=`expr ${router_array[$var]} + ${line_num} - 1`
		sed -i -e "${modify_line}s/\$/${api_tags}${security}/i" $swagger_output
	done
done

sed -i -e 's/\"tags\":/\n        "tags\":/g' $swagger_output
sed -i -e 's/\"security\":/\n        "security\":/g' $swagger_output
[ -f $swagger_output-e ] && rm $swagger_output-e

