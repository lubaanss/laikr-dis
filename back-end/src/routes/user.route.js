let bcrypt = require("bcryptjs");
let jwt = require("jsonwebtoken");

let mongoose = require("mongoose"),
  express = require("express"),
  router = express.Router();
// Lietotaja modelis
let userSchemae = require("../Models/Models/User");

// UZtaisa lietojaju
router.route("/create-user").post(async (req,res,next) =>
{
  //Izvada pieprasijuma datus
  console.log(req.body);

  // Parbauda vai epasts jau eksistee
  let emailExist = await userSchemae.findOne({ email: req.body.email });

  if (emailExist) return res.status(400).send("Email already exsist");

  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(req.body.password,salt)

  // Uztaisa jaunu lietotaju
  const user = new userSchemae({
    name: req.body.name,
    email: req.body.email,
    password: hashedPassword,


  });
  try
  {
    const savedUser = user.save()
    res.json({ id: user._id })
  } catch (error)
  {
    console.log("Error is occuring on the way")
    res.status(400).send(error)
  }


});

//login
router.route("/login").post(async (req,res,next) =>
{
  // epasts
  let q = await userSchemae.findOne({ email: req.body.email });

  if (!q) return res.status(400).send("Email Not Found");

  //parbauda paroli
  let passwordCheck = await bcrypt.compare(req.body.password,q.password);
  if (!passwordCheck) return res.status(200).send("Invalid Password");

  const token = jwt.sign({ _id: q._id },"secretkey");


  res.cookie("accessToken",token,{
    httpOnly: true,
  })
    .status(200)
    .json(q);
});

//izlogosanas

router.route("/logout").post((req,res) =>
{
  res.clearCookie("accessToken",{
    secure: true,
    sameSite: "none"
  }).status(200).json("User has been logged out.")
}

);




// izlasa visus lietotajus
router.route("/").get((req,res) =>
{
  userSchemae.find((error,data) =>
  {
    if (error)
    {
      return next(error);
    } else
    {
      res.json(data);
    }
  });
});
// panem vienu lietotaju
router.route("/edit-user/:id").get((req,res) =>
{
  userSchemae.findById(req.params.id,(error,data) =>
  {
    if (error)
    {
      return next(error);
    } else
    {
      res.json(data);
    }
  });
});

// dabon vairakus parametrus
router.route("/get-user/:name/:password").get((req,res) =>
{
  userSchemae.find(
    { name: req.params.name,password: req.params.password },
    (error,data) =>
    {
      if (error)
      {
        res.json("User Credential not match");
        return next(error);
      } else
      {
        res.json(data);
      }
    }
  );
});

// apdeito lietotaju
router.route("/update-user/:id").put((req,res,next) =>
{
  userSchemae.findByIdAndUpdate(
    req.params.id,
    {
      $set: req.body,
    },
    (error,data) =>
    {
      if (error)
      {
        return next(error);
        console.log(error);
      } else
      {
        res.json(data);
        console.log("User updated successfully !");
      }
    }
  );
});
// izdzesa lietotaju
router.route("/delete-user/:id").delete((req,res,next) =>
{
  userSchemae.findByIdAndRemove(req.params.id,(error,data) =>
  {
    if (error)
    {
      return next(error);
    } else
    {
      res.status(200).json({
        msg: data,
      });
    }
  });
});
module.exports = router;
