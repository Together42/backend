export const jsonErrList = {
  auth: {
    A001: "User exists ",
    A003: "Expected an object with company_name, tax_id, phnoe_nb but got: ",
    A004: "Company exists ",
    A005: "Server Error",
    A006: "Unknown email or password",
    A007: "User status is not authorized yet",
    A008: "DB tuples update Fail",
    A009: "'user_status_cd' is changed already",
    A010: "Invalid input argument",
    A011: "Invalid mobile_nb",
  },
  jwt: {
    J001: "Authentication Error",
    J002: "jwt expired",
    J003: "invalid signature",
    J004: "Refresh token expired",
    J005: "invalid token",
    J006: "Invalid Refresh token",
  },
};
