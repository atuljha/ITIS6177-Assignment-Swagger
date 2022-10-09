const express = require('express')
const app = express()
const mariadb = require('mariadb')
const cors = require('cors');
app.use(cors({
 origin: '*'
}));

const { body, validationResult } = require('express-validator');

const pool = mariadb.createPool({
    host: 'localhost',
    user:'root',
    password: '',
    database:'sample',
    connectionLimit: 5
})

pool.getConnection((err, conn)=> {
    if(conn) conn.release
    return
})
const bodyParser = require("body-parser")

const swaggerJsDoc = require("swagger-jsdoc")
const swaggerUi = require("swagger-ui-express")

let port = 3009
let host = 'localhost'
app.listen(port, ()=>{
    console.log('Server is running on port', port);
});


const options = {
    swaggerDefinition :{
        info:{
            title:"API",
            description:"Sample  API's",
            contact : {
                name : "Atul Jha"
            },
            servers:[`http://localhost:${port}`]

        }
    },
    //
    apis:["./*.js"]

};

  const specs = swaggerJsDoc(options)
  app.use(
    "/api-docs",
    swaggerUi.serve,
    swaggerUi.setup(specs)
  )

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));


app.get('/', async (req, res) => {
    res.send("hello")
});

/**
 * @swagger
 * /agents:
 *   get:
 *     summary: Retrieve a list of agents
 *     description: Retrieve a list of agents from db. Can be used to populate a list of fake users when prototyping or testing an API.
 *     produces:
 *          - application.json
 *     responses:
 *        200:
 *           description: A list of users.
 *
 *
*/
app.get('/agents', async (req, res) => {
    try {
        const result = await pool.query("select * from agents");
        res.status(200).json(result);
    } catch (err) {
        throw err;
    }
});




app.get('/agents/:id', async (req, res) => {
    try {
        const result = await pool.query("select * from agents where AGENT_CODE = ? ", req.params.id);
        res.status(200).json(result);
    } catch (err) {
        throw err;
    }
});
app.get('/orders', async (req, res) => {
    try {
        const result = await pool.query("select * from orders");
        res.status(200).json(result);
    } catch (err) {
        throw err;
    }
});

app.get('/orders/:id', async (req, res) => {
    try {
        const result = await pool.query("select * from orders where ord_num = ?", req.params.id);
        res.status(200).json(result);
    } catch (err) {
            throw err;
    }
})


app.post('/agents',body('AGENT_NAME').notEmpty(),body('PHONE_NO').notEmpty().isAlphanumeric(),
body('WORKING_AREA').isAlphanumeric().notEmpty(), async function(req,res){
    try {
        console.log(req.body);
    // Finds the validation errors in this request and wraps them in an object with handy functions
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
        const code = generateUID()
        const sqlQuery = `INSERT INTO agents (AGENT_NAME,PHONE_NO, WORKING_AREA, AGENT_CODE) VALUES ("${req.body.AGENT_NAME}","${req.body.PHONE_NO}","${req.body.WORKING_AREA}",code );`;
        const rows = await pool.query(sqlQuery);
        res.status(200).json('Agent Id created is ' + code);

    } catch (error) {
        res.status(400).send(error.message)
    }
})


app.put('/agents',body('AGENT_NAME').notEmpty(),body('PHONE_NO').notEmpty().isAlphanumeric(),
body('NEW_PHONE_NO').notEmpty().isAlphanumeric(),
body('WORKING_AREA').isAlphanumeric().notEmpty(), async function(req,res){
    try {
            // Finds the validation errors in this request and wraps them in an object with handy functions
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    const sqlQuery = `UPDATE agents SET AGENT_NAME = "${req.body.AGENT_NAME}", WORKING_AREA = "${req.body.WORKING_AREA}" ,PHONE_NO = "${req.body.NEW_PHONE_NO}" WHERE  PHONE_NO = "${req.body.PHONE_NO}";`
    const rows = await pool.query(sqlQuery);

    res.status(200).json(`User ${req.body.AGENT_NAME} successfully Updated`);
    } catch (error) {
        res.status(400).send(error.message)
    }
})

app.patch('/agents',body('AGENT_NAME').notEmpty(),body('PHONE_NO').notEmpty().isAlphanumeric(),
body('NEW_PHONE_NO').notEmpty().isAlphanumeric(),
body('WORKING_AREA').isAlphanumeric().notEmpty(), async function(req,res){
    try {
            // Finds the validation errors in this request and wraps them in an object with handy functions
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    const sqlQuery = `UPDATE agents SET AGENT_NAME = "${req.body.AGENT_NAME}", WORKING_AREA = "${req.body.WORKING_AREA}" ,PHONE_NO = "${req.body.NEW_PHONE_NO}" WHERE  PHONE_NO = "${req.body.PHONE_NO}";`
    const rows = await pool.query(sqlQuery);

    res.status(200).json(`User ${req.body.AGENT_NAME} successfully Patched`);
    } catch (error) {
        res.status(400).send(error.message)
    }
})

app.delete('/agents',body('AGENT_NAME').notEmpty(),body('AGENT_CODE').notEmpty().isAlphanumeric(), async function(req,res){
    try {
    // Finds the validation errors in this request and wraps them in an object with handy functions
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
        const sqlQuery = `DELETE FROM agents WHERE AGENT_CODE = "${req.body.AGENT_CODE}" ;`;
        await pool.query(sqlQuery);
        res.status(200).json(`User ${req.body.AGENT_NAME} Successfully Deleted`);
    } catch (error) {
        res.status(400).send(error.message)
    }
});



function generateUID() {
    // I generate the UID from two parts here 
    // to ensure the random number provide enough bits.
    var firstPart = (Math.random() * 46656) | 0;
    var secondPart = (Math.random() * 46656) | 0;
    firstPart = ("000" + firstPart.toString(36)).slice(-3);
    secondPart = ("000" + secondPart.toString(36)).slice(-3);
    return firstPart + secondPart;

}


/* Aws Lambda api gateway and lambda call */
const axios = require('axios')
   app.get('/say', function (req, res) {
        try {
            axios.get('https://j65i579qbk.execute-api.us-east-1.amazonaws.com/stage/',{ params: { keyword: req.query.keyword } } ).then(function (response) {
                // handle success
                res.status(200).send(response.data);
            })
            .catch(function (error) {
                res.status(501).send(error.message)
            })

        } catch (error) {
            res.status(400).send(error.message)
        }
    });

