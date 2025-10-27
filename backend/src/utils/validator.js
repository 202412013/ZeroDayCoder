const validator =require("validator");

// req.body 

const validate = (data)=>{
   
    const mandatoryField = ['firstName',"emailId",'password'];

    const IsAllowed = mandatoryField.every((k)=> Object.keys(data).includes(k));

    if(!IsAllowed){
        console.log("Validator.js File error");
        throw new Error("Some Field Missing");
    }

    if(!validator.isEmail(data.emailId)){
        console.log("Not a Strong Email");
        throw new Error("Invalid Email");
    }

    if(!validator.isStrongPassword(data.password)){
        console.log("Not a Strong Password");
        throw new Error("Week Password");
    }
}

module.exports = validate;