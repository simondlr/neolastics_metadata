const express = require('express');
const serverless = require('serverless-http');
const router = express.Router();
const app = express();

const { ethers } = require("ethers");
const { text } = require('express');

// MUST match JS + Solidity
function hexToBytes(hex) {
    for (var bytes = [], c = 0; c < hex.length; c += 2)
    bytes.push(parseInt(hex.substr(c, 2), 16));
    return bytes;
}

function generateStringSVGFromHash(hash) {
    const palette = [];
    //mondrian palette
    palette.push(`#fac901`); //y
    palette.push(`#225095`); //blue
    palette.push(`#dd0100`); //red
    palette.push(`#ffffff`); //w
    palette.push(`#000000`); //black
    palette.push("#00770F"); //green: rare 1/256 chance for a til

    const bytes = hexToBytes(hash.slice(2));
    const svg = "<svg xmlns='http://www.w3.org/2000/svg' width='300' height='300'>"
      + "<rect x='0' y='0' width='100' height='100' style='fill:"+palette[parseInt(bytes[0]/51)]+";stroke-width:3;stroke:black'/>" // tile 1
      + "<rect x='0' y='100' width='100' height='100' style='fill:"+palette[parseInt(bytes[1]/51)]+";stroke-width:3;stroke:black'/>" // tile 2
      + "<rect x='0' y='200' width='100' height='100' style='fill:"+palette[parseInt(bytes[2]/51)]+";stroke-width:3;stroke:black'/>" // tile 3
      + "<rect x='100' y='0' width='100' height='100' style='fill:"+palette[parseInt(bytes[3]/51)]+";stroke-width:3;stroke:black'/>" // tile 4
      + "<rect x='100' y='100' width='100' height='100' style='fill:"+palette[parseInt(bytes[4]/51)]+";stroke-width:3;stroke:black'/>" // tile 5
      + "<rect x='100' y='200' width='100' height='100' style='fill:"+palette[parseInt(bytes[5]/51)]+";stroke-width:3;stroke:black'/>" // tile 6
      + "<rect x='200' y='0' width='100' height='100' style='fill:"+palette[parseInt(bytes[6]/51)]+";stroke-width:3;stroke:black'/>" // tile 7
      + "<rect x='200' y='100' width='100' height='100' style='fill:"+palette[parseInt(bytes[7]/51)]+";stroke-width:3;stroke:black'/>" // tile 8
      + "<rect x='200' y='200' width='100' height='100' style='fill:"+palette[parseInt(bytes[8]/51)]+";stroke-width:3;stroke:black'/>" // tile 9
      + "</svg>";
  
    return svg;
}

/*
6 colours.
Attributes:
Trait Type: Amount of Colours.
Values: [1,2,3,4,5,6]

Trait Type: Red Tiles
Values: Values: [1,2,3,4,5,6]

...rest of the colours.
*/
function generateAttributesFromHash(hash) {
    const bytes = hexToBytes(hash.slice(2));
    const traits = {};
    const attributes = [];

    for(let i = 0; i<9; i+=1) {
        const cnr = parseInt(bytes[i]/51);

        if(cnr === 0) { if ('y' in traits) { traits.y.value += 1; } else { traits.y = { value: 1, type: "Yellow Tiles" }; }}
        if(cnr === 1) { if ('b' in traits) { traits.b.value += 1; } else { traits.b = { value: 1, type: "Blue Tiles" }; }}
        if(cnr === 2) { if ('r' in traits) { traits.r.value += 1; } else { traits.r = { value: 1, type: "Red Tiles" }; }}
        if(cnr === 3) { if ('w' in traits) { traits.w.value += 1; } else { traits.w = { value: 1, type: "White Tiles" }; }}
        if(cnr === 4) { if ('bl' in traits) { traits.bl.value += 1; } else { traits.bl = { value: 1, type: "Black Tiles" }; }}
        if(cnr === 5) { if ('g' in traits) { traits.g.value += 1; } else { traits.g = { value: 1, type: "Green Tiles" }; }}
    }

    for (const key of Object.keys(traits)) {
        let textValue;
        switch (traits[key].value) {
            case 1: textValue = 'One'; break;
            case 2: textValue = 'Two'; break;
            case 3: textValue = 'Three'; break;
            case 4: textValue = 'Four'; break;
            case 5: textValue = 'Five'; break;
            case 6: textValue = 'Six'; break;
        }
        const trait = { 
            "trait_type": traits[key].type,
            "value": textValue 
        }
        attributes.push(trait);
    }

    const total = {trait_type: "Amount of Colours", value: attributes.length };
    attributes.push(total);

    return attributes;

}

function generateMetadata(req, res) {
    const hash = ethers.BigNumber.from(req.params.id).toHexString();
    const truncated = hash.slice(0,20); // 0x + 9 bytes
    const svg = generateStringSVGFromHash(hash);
    const attributes = generateAttributesFromHash(hash);
    return res.status(200).json({ 
        name: "Neolastic "+truncated,
        description: "Liquid On-Chain Generative Neo-Plastic Art",
        image_data: svg,
        attributes: attributes
    })
}

router.get('/:id', generateMetadata);

app.use(express.urlencoded({ extended: true }))
app.use(express.json())
app.use('/.netlify/functions/server', router)

module.exports = app
module.exports.handler = serverless(app);

/*app.listen(3001, () => {
    console.log(`Example app listening at http://localhost:3001`)
});*/