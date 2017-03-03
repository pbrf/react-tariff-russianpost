import React, { Component, PropTypes } from 'react';
import { Row, Col } from 'react-bootstrap';

export default class Tariff extends Component {

    constructor(props) {
        super(props);
        this.state = {
            status: 0,
            paynds: 0,
            paymark: 0,
            cover: 0,
            service: 0,
            pay: 0,
            valnds: 0,
            needed_attrs: ['weight', 'index_from', 'index_to', 'type'],
            success: false,
            counter: {},
            obj: { "weight": 0, "index_from": 0, "index_to": 0, "type": 0 },
            url: 'http://beta.pbrf.ru/v1/'
        }
        this.calcPayment = this.calcPayment.bind(this);
    }

    calcPayment() {
        let _this = this;
        let data = _this.props.data;
        if (data.sumoc !== 0 && data.sum_num !== 0) {
            data.cat = '4';
        } else if (data.sumoc !== 0 && data.sum_num === 0) {
            data.cat = '2';
        } else {
            data.cat = '0';
        }
        data.Value = data.value * 100;
        data.sum_num = data.sumNum * 100;
        data.direction = '0';
        data.service = '""';
        fetch(this.state.url + 'utils/tariff/calc', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            body: JSON.stringify(data)
        }).then((response) => {
            return response.json();
        }).then((json) => {
            if (json.paynds) {
                _this.setState({ status: 1 });
                _this.setState({ success: true });
                _this.setState({
                    paynds: json.paynds / 100,
                    pay: json.pay / 100, valnds: json.ground.valnds / 100, cover: json.tariff[1].cover.valnds / 100
                });
                if (json.service) {
                    _this.setState({ service: json.service.valnds / 100 });
                } else {
                    _this.setState({ service: 0.00 });
                }

            } else {
                _this.setState({ status: 2 });
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
                    if (counter >= this.state.needed_attrs.length) {
                        this.calcPayment();
                    }
                }
            }
        });
    }



    render() {
        return (
            <Row style={this.state.success ? null : { display: 'none' }}>
                <Col xs={12} md={6} mdOffset={3}>
                    Результат:
                <ul>
                        <li>Почтовый сбор: {this.state.valnds} рублей(с НДС).</li>
                        <li>Страхование: {this.state.cover} рублей(с НДС).</li>
                        <li>Дополнительные услуги: {this.state.service} рублей(с НДС).</li>
                        <li>Итого сумма без НДС: {this.state.pay} рублей.</li>
                        <li>Итого сумма с НДС 18%: {this.state.paynds} рублей.</li>
                    </ul>
                </Col>
            </Row>
        )
    }
}
