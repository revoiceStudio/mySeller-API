const request = require('request')
const iconv = require('iconv-lite')
const xml2js = require('xml2js')
const parser = new xml2js.Parser()

updatePrice = function(apikey, prdNo, selPrc){
    return new Promise( async function(resolve, reject){
        const updatedPrice = await getProductPriceUpdate(apikey, prdNo, selPrc)    
        return resolve(updatedPrice)
    })

}
// 11번가 가격 업데이트
function getProductPriceUpdate(apikey, prdNo, selPrc){
    return new Promise((resolve, reject)=>{
        const options = {
            'url' : process.env.productPriceAPI + prdNo +"/"+selPrc,
            'headers' : {
                'openapikey': apikey
            },
            'encoding': null        
        }    
        request.get(options, async (error, response, body) =>{
            const strContents = new Buffer.from(body);
            const decoded = iconv.decode(strContents, 'euc-kr')            
            parser.parseString(decoded, function(err, result) {
                resolve(result.ClientMessage)
            })
        })
    })    
}

module.exports = { updatePrice }