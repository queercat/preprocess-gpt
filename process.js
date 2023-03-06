const fs = require("fs");
const { clearInterval } = require("timers");
require("dotenv").config();

const GPT_KEY = process.env.GPT_KEY;

let promises = 0;
let output = [];

function decrease() {
    promises -= 1;
}

function preprocess(path) {
    const re = /^\/\*.*\*\/(\r$|$)/g
    
    const data = fs.readFileSync(path, 'utf-8');
    let lines = data.split('\n');
    
    for (_ in lines) {
        output.push([]);
    }

    for (let idx in lines) {
        const line = lines[idx];   
        
        if (line.match(re)) {
            const p = query(line);
            promises += 1;
            p.then(data => {
                data.json().then(json => {
                    output[idx].push(json.choices[0].text);
                    decrease();
                });
            });
        } else {
            output[idx].push(line);
        }
    }
}

async function query(text) {
    const url = "https://api.openai.com/v1/completions";

    const content = {
        model: "text-davinci-003",
        prompt: text,
        temperature: 0,
        max_tokens: 256,
    };

    const req = {
        method: "POST",
    
        headers: {
            "Content-Type": "application/json",
            "Authorization": "Bearer " + GPT_KEY,
        },
        body: JSON.stringify(content)
    };

    const resp = await fetch(url, req);
    return resp;
}

function write(path) {
    let text = "";

    output.forEach(arr => {
        arr.forEach(str => {
            text += str;
        });
    })

    fs.writeFile(path, text, err => {
        if (err) {
            console.error(err);
        }
    });
}

preprocess("test.c");

const interval = setInterval(_ => {
    if (promises <= 0) {
        write("processed.c")
        clearInterval(interval);
    }

}, 50);