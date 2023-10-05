import { logger as winston_logger } from "./winston.js";
import { jsonErrList } from "./errcode.js";

export function err_log(errCode, useremail = "anonymity", err_str) {
  try {
    let errMessage = null;
    for (err_class in jsonErrList) {
      for (errCd in jsonErrList[err_class]) {
        if (errCd == errCode) {
          errMessage = jsonErrList[err_class][errCode];
          break;
        }
      }
    }

    if (errMessage == null) {
      errCode = "Unkown error";
      errMessage = "Unkown error";
    }

    const err = {
      error_code: errCode,
      message: errMessage + ", " + err_str,
      error_stack: err_str.stack,
    };
    winston_logger.error(useremail + "\t" + JSON.stringify(err));
    return err;
  } catch (error) {
    winston_logger.error(error);
  }
}
// message, useremail = 'anonymity', err_str = ""
export function info_log(message, useremail = "anonymity", err_str = "") {
  winston_logger.info(useremail + "\t" + message + "\t" + err_str);
}
