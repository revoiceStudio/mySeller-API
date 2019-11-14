const request = require('request')
const iconv = require('iconv-lite')
const xml2js = require('xml2js')
const parser = new xml2js.Parser()

getOrderConfirm = function(apikey, ordNo,ordPrdSeq,addPrdYn,addPrdNo,dlvNo){
    return new Promise( async function(resolve, reject){
        const confirmed = await orderConfirmAPI(apikey, ordNo,ordPrdSeq,addPrdYn,addPrdNo,dlvNo)       
        console.log(confirmed)
        return resolve(confirmed)
    })

}

function orderConfirmAPI(apikey, ordNo,ordPrdSeq,addPrdYn,addPrdNo,dlvNo){
    return new Promise(function(resolve, reject){
        const options = {
            'url' : process.env.orderConfirmAPI+ordNo+"/"+ordPrdSeq+"/"+addPrdYn+"/"+addPrdNo+"/"+dlvNo,
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

module.exports = { getOrderConfirm }