require("dotenv").config();
const bcryptjs = require("bcryptjs");

// password hash function
exports.hashPassword = async ( password ) => {
  console.log("hashpasswordcheckfuntion",password)
  try {
    
    const hashPassword = await bcryptjs.hash(password, 10);
    return hashPassword;
  } catch (error) {
    console.log("Hasing password logic", error);
  }
};

// password comapre funtion
exports.comparePassword = async(password, hashPassword) => {
  try {
   const isMatch = await bcryptjs.compare(password, hashPassword);
    return isMatch;
  } catch (err) {
    return err;
  }
};