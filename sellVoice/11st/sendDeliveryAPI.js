const request = require('request')
const iconv = require('iconv-lite')
const xml2js = require('xml2js')
const parser = new xml2js.Parser()

sendDelivery = function(apikey, sendDt,dlvMthdCd,dlvEtprsCd,invcNo,dlvNo){
    return new Promise( async function(resolve, reject){
        const sent = await sendDeliveryAPI(apikey, sendDt,dlvMthdCd,dlvEtprsCd,invcNo,dlvNo)       
        console.log(sent)
        return resolve(sent)
    })

}

function sendDeliveryAPI(apikey, sendDt,dlvMthdCd,dlvEtprsCd,invcNo,dlvNo){
    return new Promise(function(resolve, reject){
        const options = {
            'url' : process.env.sendDeliveryAPI+sendDt+"/"+dlvMthdCd+"/"+dlvEtprsCd+"/"+invcNo+"/"+dlvNo,
            'headers' : {
                'openapikey': apikey
            },
            'encoding': null        
        }    
        request.get(options, async (error, response, body) =>{
            const strContents = new Buffer.from(body);
            const decoded = iconv.decode(strContents, 'euc-kr')            
            parser.parseString(decoded, function(err, result) {
               return resolve(result['ResultOrder'])
            })
        })
    })
    
}

module.exports = { sendDelivery }