#!/usr/bin/env bash

node src/swagger/swagger.js
router_num=`cat src/swagger/swagger-docs.json | grep -n "/api/" | awk -F: '{print $1}'`
IFS=$'\n'
router_num_array=($router_num)
router_num_array_length=${#router_num_array[@]}

for ((var=0 ; var < $router_num_array_length ; var++));
do
	router=`sed -n "${router_num_array[$var]}p" src/swagger/swagger-docs.json | awk '{split($1, array, ":"); print array[1];}'`
	api_tags=`sed -n "${router_num_array[$var]}p" src/swagger/swagger-docs.json | awk '{split($1, array, "/"); printf "\"tags\": [\"%s\"],\n", array[3];}'`
	next_var=`expr ${var} + 1`
	if [ $next_var -ge $router_num_array_length ]; then
		method_num=`sed -n "${router_num_array[$var]},\'$'p" src/swagger/swagger-docs.json | grep -n "\"get\":\|\"post\":\|\"delete\":\|\"put\":\|\"patch\":" | awk -F: '{print $1}'`
	else
		method_num=`sed -n "${router_num_array[$var]},${router_num_array[$next_var]}p" src/swagger/swagger-docs.json | grep -n "\"get\":\|\"post\":\|\"delete\":\|\"put\":\|\"patch\":" | awk -F: '{print $1}'`
	fi
	method_num_array=($method_num)
	for line_num in ${method_num[@]};
	do
		modify_line_num=`expr ${router_num_array[$var]} + ${line_num} - 1`
		method=`sed -n "${modify_line_num}p" src/swagger/swagger-docs.json | awk '{split($1, array, "\""); print array[2];}'`
		sed -i -e "${modify_line_num}s/\$/${api_tags}/i" src/swagger/swagger-docs.json
		if [ "${api_tags}" != "\"tags\": [\"auth\"]," -a "${method}" != "get" ]; then
			sed -i -e "${modify_line_num}s/\$/\"security\": [{\"bearerAuth\": []}],/i" src/swagger/swagger-docs.json
		elif [ $router == "\"/api/auth/me\"" -a "${method}" == "get" ]; then
			sed -i -e "${modify_line_num}s/\$/\"security\": [{\"bearerAuth\": []}],/i" src/swagger/swagger-docs.json
		fi
	done
done

sed -i -e 's/\"tags\":/\n        "tags\":/g' src/swagger/swagger-docs.json
sed -i -e 's/\"security\":/\n        "security\":/g' src/swagger/swagger-docs.json
[ -f src/swagger/swagger-docs.json-e ] && rm src/swagger/swagger-docs.json-e

