import React, { Component } from 'react';
import { Row, Col, Alert } from 'react-bootstrap';

export default class Tariff extends Component {

    constructor(props) {
        super(props);
        this.state = {
            status: 0,
            paynds: 0,
            paymark: 0,
            cover: 0,
            service: "",
            pay: 0,
            valnds: 0,
            needed_attrs: ['weight', 'index_from', 'index_to', 'type', 'service'],
            success: false,
            counter: {},
            obj: { "weight": 0, "index_from": 0, "index_to": 0, "type": 0, 'service': 0},
            url: 'http://beta.pbrf.ru/v1/',
            errors: []
        }
        this.calcPayment = this.calcPayment.bind(this);
    }

    calcPayment() {
        let _this = this;
        let data = _this.props.data;
        if (data.value !== 0 && data.sumNum !== 0) {
            data.cat = '4';
        } else if (data.value !== 0 && data.sumNum === 0) {
            data.cat = '2';
        } else {
            data.cat = '0';
        }
        data.Value = data.value * 100;
        data.sum_num = data.sumNum * 100;
        data.direction = '0';
        if (data.service !== undefined && data.service.length !== 0){
            data.service = data.service.join();
        } else {
            data.service = '""';
        }
        fetch(_this.state.url + 'utils/tariff/calc', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            body: JSON.stringify(data)
        }).then((response) => {
            return response.json();
        }).then((json) => {
            if (json.hasOwnProperty("paynds")) {
                _this.setState({ status: 1 });
                _this.setState({ success: true });
                _this.setState({
                        paynds: json.paynds / 100,
                        pay: json.pay / 100, valnds: json.ground.valnds / 100
                    });
                    if (data.cat !== 0){
                        _this.setState({cover: json.tariff[1].cover.valnds / 100});
                    }
                if (json.service) {
                    _this.setState({ service: json.service.valnds / 100 });
                } else {
                    _this.setState({ service: 0.00 });
                }

            } else {
                _this.setState({ status: 2 });
                let errorKeys = Object.keys(json);
                let errorsArray = [];
                _this.setState({ success: true });
                let msg;
                errorKeys.forEach(item=>{
                    switch(item) {
                        case "weight": msg = "Поле 'Масса посылки' заполнено не корректно. Также, поле вес не может превышать 2000 грамм."; errorsArray.push(msg); break;
                        case "index_from": msg = "Поле 'Почтовый индекс' отправителя заполнено не корректно."; errorsArray.push(msg); break;
                        case "index_to": msg = "Поле 'Почтовый индекс' получателя заполнено не корректно."; errorsArray.push(msg); break;
                        case "sum_num": msg = "Поле 'Сумма наложенного платежа' заполнено не корректно."; errorsArray.push(msg); break;
                        case "Value": msg = "Поле 'Сумма объявленной ценности' заполнено не корректно."; errorsArray.push(msg); break;
                    }                   
                });
                _this.setState({errors: errorsArray});
            }
            return json;
        })
            .catch((error) => {
                return error;
            });;
        return false;
    }

    componentWillReceiveProps(nextProps) {
        let keys = Object.keys(nextProps.data);
        let obj = this.state.obj;
        keys.forEach(key => {
            if (this.props.data[key] !== nextProps.data[key]) {
                this.props.data[key] = nextProps.data[key];
                if (this.state.obj.hasOwnProperty(key) && this.state.obj[key] === 0) {
                    obj[key] = 1;
                    this.setState({ obj: obj });
                }
                if (this.props.data[key]) {

                    let counter = Object.keys(this.state.obj).map(item => {
                        return obj[item] === 1
                    }).length;
                    if (counter >= this.state.needed_attrs.length - 1) {
                        this.calcPayment();
                    }
                }
            }
        });
    }



    render() {
        return (
            <Row style={this.state.success ? null : { display: 'none' }}>
                <Col xs={12} md={6} mdOffset={3} sm={12} xs={12} style={this.state.status === 1 ? null : { display: 'none' }}>
                    Результат:
                <ul>
                        <li>Сумма при оплате марками: {this.state.valnds} рублей(с НДС).</li>
                        <li>Страхование: {this.state.cover} рублей(с НДС).</li>
                        <li>Дополнительные услуги: {this.state.service} рублей(с НДС).</li>
                        <li>Итого сумма без НДС: {this.state.pay} рублей.</li>
                        <li>Итого сумма с НДС 18%: {this.state.paynds} рублей.</li>
                    </ul>
                </Col>
                <Col md={6} mdOffset={3} sm={12} xs={12}>
                 {this.state.status == 2
                                ? <Alert bsStyle="danger" onDismiss={(e) => this.setState({ status: 0 })}>
                                    {
          this.state.errors.map(function(error) {
            return <li key={error}>{error}</li>
          })
        }
                                </Alert>
                                : null}
                                </Col>
            </Row>
        )
    }
}
