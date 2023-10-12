const fs = require('fs')

const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function async_prompt(prompt) {
    return new Promise(resolve => {
        rl.question(prompt, resolve);
    });
}

(async () => {
    let radios = {}
    
    for (let i = 1; i <= 18; i++) {
        const radio = await async_prompt(`Enter radio number for Node ${i - 1}: `);
        let num = parseInt(radio)

        radios[`Node ${i}`] = isNaN(num) ? "None" : {
            SRN: parseInt(radio),
            RadioA: 1,
            RadioB: 2
        }
    }
    
    fs.writeFileSync(`scenario_${Date.now()}.json`, JSON.stringify(radios, null, 2));
    rl.close();
})()