const express = require('express')
const controller = require('./controller')
const router = express.Router()

router.use(express.json())

// API
router.get('/api_check',controller.api_check)
router.get('/api_find',controller.api_find)

/* 배송 프로세스*/
router.get('/payment_complete',controller.payment_complete) // 결제완료건 조회
router.get('/order_confirm', controller.order_confirm)  // 발주처리
router.get('/order_inquire',controller.order_inquire)   // 배송준비중 조회
router.get('/send_delivery', controller.send_delivery)  // 배송(운송장 등록)처리
router.get('/order_complete', controller.order_complete)    // 배송완료 조회

/* 일반 조회*/
// 상품
router.get('/search_product',controller.search_product)
router.get('/search_product_detail', controller.search_product_detail)
// 문의
router.get('/search_inquiry', controller.search_inquiry)
router.get('/answer_inquiry', controller.answer_inquiry)
// 판매 중지,해제
router.get('/stop_display',controller.stop_display)
router.get('/restart_display',controller.restart_display)

// 가격 변경
router.get('/update_price', controller.update_price)
module.exports = router