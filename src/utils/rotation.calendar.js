import { addHolidayInfo, getHolidayByMonth } from "../data/rotation.js";
import request from "request";
import { config } from "../config.js";

export function getTodayDate() {
  const today = new Date();
  const date = today.getDate();
  return (date);
}

const MONTH_IN_YEAR = 12;
const DAY_IN_WEEK = 7;

const DAY_OF_THURSDAY = 4;

const getFirstDateOfMonth = (date, offsetMonth = 0) =>
    new Date(date.getFullYear(), date.getMonth() + offsetMonth, 1);
const getFirstDayOfMonth = (date, offsetMonth = 0) => getFirstDateOfMonth(date, offsetMonth).getDay();

const getFourthWeekPeriod = (date = new Date()) => {
    const firstDay = getFirstDayOfMonth(date); // 첫째날 day
    let dateOfThursdayOnFirstWeek; // 첫쨰주에 무조건 존재하는 목요일을 기준으로 탐색.
    if (firstDay <= DAY_OF_THURSDAY) {
        dateOfThursdayOnFirstWeek = 1 + DAY_OF_THURSDAY - firstDay;
    } else {
        dateOfThursdayOnFirstWeek = 1 + DAY_IN_WEEK + DAY_OF_THURSDAY - firstDay;
    }
    const dateOfThursdayOnFourthWeek = dateOfThursdayOnFirstWeek + 3 * DAY_IN_WEEK;
    const dateOfMondayOnFourthWeek = dateOfThursdayOnFourthWeek - 3;
    const dateOfSundayOnFourthWeek = dateOfThursdayOnFourthWeek + 3;
    return [dateOfMondayOnFourthWeek, dateOfSundayOnFourthWeek];
};

export const getFourthWeekdaysOfMonth = (date = new Date()) => {
    const [dateOfMondayOnFourthWeek, dateOfSundayOnFourthWeek] = getFourthWeekPeriod(date);
    const dateOfFridayOnFourthWeek = dateOfSundayOnFourthWeek - 2;
    return [dateOfMondayOnFourthWeek, dateOfFridayOnFourthWeek]
};

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