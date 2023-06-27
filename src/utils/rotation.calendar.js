import request from "request";
import { config } from "../config.js";


export function getTodayDate() {
  const today = new Date();
  const date = String(today.getDate()).padStart(2, '0');
  return (date);
}

export function getFourthWeekdaysOfMonth() {
  const today = new Date();
  const year = today.getFullYear();
  const month = today.getMonth() + 1;

  const lastDate = new Date(year, month, 0);
  const lastDayOfMonth = lastDate.getDay();
  const lastDateOfMonth = lastDate.getDate();
  const fourthWeekStartDay = lastDateOfMonth - lastDayOfMonth - 6;
  const fourthWeekDays = [];

  for (let i = 0; i < 5; i++) {
    const day = fourthWeekStartDay + i;
    if (day > 0 && day <= lastDateOfMonth) {
      fourthWeekDays.push(day);
    }
  }
  return (fourthWeekDays);
}

export async function getHolidayOfMonth() {
  const URL = 'http://apis.data.go.kr/B090041/openapi/service/SpcdeInfoService/getHoliDeInfo';
  const solYear = new Date().getFullYear();
  const month = new Date().getMonth() + 1;
  const solMonth = month < 10 ? '0' + month : month;
  const SERVICEKEY = config.openApi.holidayKey;
  const requestUrl = URL + '?' + 'solYear=' + solYear + '&' + 'solMonth=' + solMonth + '&' + 'ServiceKey=' + SERVICEKEY + '&' + '_type=json';
  
  return new Promise((resolve, reject) => {  
    request(requestUrl, function (error, response, body) {
      if (error) {
        reject ({ status: response.statusCode, message: "openApi query error" });
      }
      const returnData = JSON.parse(body);
      const items = returnData['response']['body']['items']['item'];
      let holidayArray = [];
      if (Array.isArray(items)) {
        for (let i = 0; i < items.length; i++) {
          let item = items[i];
          if (item['locdate']) {
            holidayArray.push(item['locdate']);
          }
        }
      } else if (typeof items === 'object') {
        if (items['locdate']) {
          holidayArray.push(items['locdate']);
        }
      }
      resolve ({ status: response.statusCode, data: holidayArray });
    });
  });
}
