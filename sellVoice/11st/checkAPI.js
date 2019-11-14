const request = require('request')
const iconv = require('iconv-lite')
const xml2js = require('xml2js')
const parser = new xml2js.Parser()

checkResult = function(apikey){
    return new Promise( async function(resolve, reject){
        const checked = await getCheckAPI(apikey)       
        console.log(checked)
        return resolve(checked)
    })

}

function getCheckAPI(apikey){
    return new Promise(function(resolve, reject){
        const options = {
            'url' : process.env.checkAPI,
            'headers' : {
                'openapikey': apikey
            },
            'encoding': null        
        }    
        request.get(options, async (error, response, body) =>{
            const strContents = new Buffer.from(body);
            const decoded = iconv.decode(strContents, 'euc-kr')            
            parser.parseString(decoded, function(err, result) {
                if(result['AuthMessage']){
                    return resolve(result['AuthMessage']['resultCode'][0])
                }else{
                    return resolve("200")
                }                
            })
        })
    })
    
}

module.exports = { checkResult }