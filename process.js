const fs = require('fs');
const { clearInterval } = require('timers');
require('dotenv').config();

const GPT_KEY = process.env.GPT_KEY;
const config = JSON.parse(fs.readFileSync('config.json'));

function get_regex(file_type) {
    if (file_type == 'c' || file_type == 'js' || file_type == 'c++') {
        let looks_like = '/* */';
        return /^\/\*.*\*\/(\r$|$)/g;
    }

    else if (file_type == 'py') {
        let looks_like = '# @';
        return /^#.*@(\r$|$)/g;
    }

    else if (file_type == 'go') {
        let looks_like = '// @';
        return /^\/\/.*@(\r$|$)/g;
    }

    else {
        let looks_like = '/* */';
        return /^\/\*.*\*\/(\r$|$)/g;
    }
}

function preprocess(path) {
    const re = get_regex(path.split('.').slice(-1));

    const data = fs.readFileSync(path, 'utf-8');
    let lines = data.split('\n');
    
    let output = [];

    let promises = [];
    let indices = [];

    for (_ in lines) {
        output.push([]);
    }

    for (let idx in lines) {
        const line = lines[idx];   
        
        if (line.match(re)) {
            const p = query(line);

            promises.push(p);
            indices.push(Number(idx));
        } else {
            output[idx].push(line);
        }
    }

    let result = {
        path: path.split('/').slice(-1),
        output: output,
        promises: Promise.all(promises),
        indices: indices
    };

    return result;
}

async function query(text) {
    const url = 'https://api.openai.com/v1/completions';

    const content = {
        model: 'text-davinci-003',
        prompt: text,
        temperature: 0,
        max_tokens: 256,
    };

    const req = {
        method: 'POST',
    
        headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + GPT_KEY,
        },
        body: JSON.stringify(content)
    };

    const resp = await fetch(url, req);
    return resp;
}

async function get_data(processed_object) {
    let output = [];
    
    await processed_object.promises.then(promises => {
        promises.forEach(promise => {
            output.push(promise.json());
        });
    });

    return Promise.all(output);
}

async function write(processed_object) {
    let responses = await get_data(processed_object);
    let text = '';

    responses.forEach(response => {
        let idx = processed_object.indices.shift();
        response.choices[0].text.split('\n').forEach(line => {
            processed_object.output[idx].push(line);
        });
    });

   processed_object.output.forEach(section => {
        section.forEach(line => {
            text += line + '\n';
        });
   });

   fs.writeFileSync(config.output_directory + '/' + processed_object.path, text, err => {
        if (err) {
            console.error(err);
        }

        console.log(`${processed_object.path} written sucessfully!`);
   });
}

const dir = fs.readdirSync(config.files_directory);

dir.forEach(file => {
    let res = preprocess(config.files_directory + '/' + file);
    write(res);
});