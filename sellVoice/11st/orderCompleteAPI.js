const request = require('request')
const iconv = require('iconv-lite')
const xml2js = require('xml2js')
const parser = new xml2js.Parser()

getOrderComplete = function(startTime,endTime, userAPI){
    return new Promise( async function(resolve, reject){
        const orderedProduct = await getOrderProduct(startTime,endTime,userAPI)
        
        //조회된 결과가 없습니다.
        if(orderedProduct['ns2:result_code']==0){
            console.log( orderedProduct['ns2:result_text'][0] )
            resolve(orderedProduct['ns2:result_code'][0])
            return
        }
        //주문/클레임 조회 오류 MSG : OpenAPI Key 에 해당하는 유저가 없습니다. 비지니스 Error. 예외적으로 발생되는 모든 에러. 메시지는 일정하지 않습니다.
        else if(orderedProduct['ns2:result_code']==-1){
            console.log( orderedProduct['ns2:result_text'][0] )
            resolve(orderedProduct['ns2:result_code'][0])
            return
        }
        //start_dt의 조회 기간의 포멧(&#39;YYYYMMDDHH24:MI&#39;)이 올바르지 않습니다. 
        else if(orderedProduct['ns2:result_code']==-3902){
            console.log( orderedProduct['ns2:result_text'][0] )
            resolve(orderedProduct['ns2:result_code'][0])
            return
        }
        //end_dt의 조회 기간의 포멧(&#39;YYYYMMDDHH24:MI&#39;)이 올바르지 않습니다.
        else if(orderedProduct['ns2:result_code']==-3903){
            console.log( orderedProduct['ns2:result_text'][0] )
            resolve(orderedProduct['ns2:result_code'][0])
            return
        }
        //최대 조회기간은 일주일 입니다. 
        else if(orderedProduct['ns2:result_code']==-3904){
            console.log( orderedProduct['ns2:result_text'][0] )
            resolve(orderedProduct['ns2:result_code'][0])
            return
        }
        //서버 점검중입니다. 설명 - 매주 금요일 새벽은 정기점검일입니다.
        else if(orderedProduct['ns2:result_code']==-1000){
            console.log( orderedProduct['ns2:result_text'][0] )
            resolve(orderedProduct['ns2:result_code'][0])
            return
        }
        
        const orders = orderedProduct['ns2:order']
        orders['result_code']
        for(let i=0; i<orders.length; i++){
             const product = await getSearchProduct(userAPI, orders[i]['prdNo'][0])
             orders[i]['image'] = product['prdImage01']
        }
        console.log(orders)
        resolve(orders)
    })

}

function getOrderProduct(startTime,endTime,userAPI){
    return new Promise(function(resolve, reject){
        const options = {
            'url' : process.env.orderCompleteAPI + startTime +"/"+endTime,
            'headers' : {
                'openapikey': userAPI
            },
            'encoding': null        
        }    
        request.get(options, async (error, response, body) =>{
            const strContents = new Buffer.from(body);
            const decoded = iconv.decode(strContents, 'euc-kr')            
            parser.parseString(decoded, function(err, result) {
                console.log(result['ns2:orders'])
                resolve(result['ns2:orders'])
            })
        })
    })
    
}
function getSearchProduct(userAPI, prdNo){
    return new Promise(function(resolve,reject){
        const options = {
            'url' : process.env.searchProductAPI + prdNo,
            'headers' : {
                'openapikey': userAPI
            },
            'encoding': null        
        }
        request.get(options, async (error, response, body) =>{
            var strContents = new Buffer.from(body);
            const products = iconv.decode(strContents, 'euc-kr')
            parser.parseString(products, function(err, result) {
                const products = result['Product']
                resolve(products)
            })            
        })
    })
}

module.exports = { getOrderComplete }