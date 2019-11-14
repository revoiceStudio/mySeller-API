const request = require('request')
const iconv = require('iconv-lite')
const xml2js = require('xml2js')
const parser = new xml2js.Parser()

stop = async function(userAPI, prdNo){
    const stopedProduct = await productStopDisplay(userAPI, prdNo)
    return stopedProduct
}
// 11번가 판매중지 처리
function productStopDisplay(userAPI, prdNo){
    return new Promise((resolve, reject)=>{
        const options = {
            'url' : process.env.productStopDisplayAPI + prdNo,
            'headers' : {
                'openapikey': userAPI
            },
            'encoding': null        
        }    
        request.put(options, async (error, response, body) =>{
            const strContents = new Buffer.from(body);
            const decoded = iconv.decode(strContents, 'euc-kr')            
            parser.parseString(decoded, function(err, result) {
                resolve(result.ClientMessage)
            })
        })
    })    
}

module.exports = { stop }