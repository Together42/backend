import { addHolidayInfo, getHolidayByMonth } from "../data/rotation.js";
import request from "request";
import { config } from "../config.js";

export function getTodayDate() {
  const today = new Date();
  const date = today.getDate();
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

export async function storeHolidayInfo() {
  const URL = 'http://apis.data.go.kr/B090041/openapi/service/SpcdeInfoService/getHoliDeInfo';
  let month = new Date().getMonth() + 2;
  const solMonth = month < 10 ? '0' + month : month;
  let year = new Date().getFullYear();
  const solYear = month === 1 ? year += 1 : year;
  const SERVICEKEY = config.openApi.holidayKey;
  const requestUrl = URL + '?' + 'solYear=' + solYear + '&' + 'solMonth=' + solMonth + '&' + 'ServiceKey=' + SERVICEKEY + '&' + '_type=json';

  return new Promise((resolve, reject) => {
    request(requestUrl, async function (error, response, body) {
      if (error) {
        reject ({ status: response.statusCode, message: "openApi query error" });
      }
      const returnData = JSON.parse(body);
      const items = returnData['response']['body']['items']['item'];
      if (Array.isArray(items)) {
        for (let i = 0; i < items.length; i++) {
          let holidayArray = [];
          let item = items[i];
          if (item['locdate']) {
            console.log(item['locdate'], typeof(item['locdate']));
            const holidayInfo = {
              year: item['locdate'].toString().substr(0, 4),
              month: item['locdate'].toString().substr(4, 2),
              day: item['locdate'].toString().substr(6, 2),
              info: item['dateName']
            };
            holidayArray.push(holidayInfo);

            await addHolidayInfo(holidayInfo)
              .catch(error => reject({ status: 500, message: error }));
          }
        }
      } else if (typeof items === 'object') {
        if (items['locdate']) {
          let holidayArray = [];
          const holidayInfo = {
            year: items['locdate'].toString().substr(0, 4),
            month: items['locdate'].toString().substr(4, 2),
            day: items['locdate'].toString().substr(6, 2),
            info: items['dateName']
          };
          holidayArray.push(holidayInfo);

          await addHolidayInfo(holidayInfo)
            .catch(error => reject({ status: 500, message: error }));
        }
      }
      resolve ({ status: response.statusCode });
    });
  });
}

export async function getHolidayOfMonth() {
  let month = new Date().getMonth() + 2;
  let year = month === 1 ? new Date().getFullYear() + 1 : new Date().getFullYear();
  month = 11;
  const holidayArray = await getHolidayByMonth({ year: year, month: month });
  console.log(holidayArray);
}