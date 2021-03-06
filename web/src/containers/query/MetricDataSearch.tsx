import { CloseOutlined, LoadingOutlined, SearchOutlined } from '@ant-design/icons';
import { Alert, Button, Card, Col, Form, Input, Row, Tabs } from 'antd';
import DatabaseNameSelect from 'components/meta/DatabaseNames';
import Metric from 'components/metric/Metric';
import ExplainStats from 'components/query/ExplainStats';
import { autobind } from 'core-decorators';
import { observer } from 'mobx-react';
import { ChartStatusEnum } from 'model/Chart';
import { UnitEnum } from 'model/Metric';
import * as React from 'react';
import StoreManager from 'store/StoreManager';

const { TextArea } = Input;
const { TabPane } = Tabs;

interface MetricDataSearchProps {
}

interface MetricDataSearchStatus {
  ql: string
}

const chartID = "9999999999999999"

@observer
export default class MetricDataSearch extends React.Component<MetricDataSearchProps, MetricDataSearchStatus> {

  constructor(props: MetricDataSearchProps) {
    super(props)

    this.state = {
      ql: StoreManager.URLParamStore.getValue("ql"),
    }
  }

  componentWillUnmount(): void {
    StoreManager.ChartStore.unRegister(chartID)
  }

  @autobind
  async searchQL() {
    const { ql } = this.state;
    StoreManager.ChartStore.reRegister(chartID, {
      target: {
        db: StoreManager.URLParamStore.getValue("db"),
        ql: ql,
      }
    })
    StoreManager.URLParamStore.changeURLParams({ ql: ql })
    StoreManager.URLParamStore.forceChange()
  }

  @autobind
  renderChartStatus() {
    const chartStatus = StoreManager.ChartStore.chartStatusMap.get(chartID)
    if (!chartStatus) {
      return
    }
    if (chartStatus.status === ChartStatusEnum.Init) {
      return
    } else if (chartStatus.status === ChartStatusEnum.Loading) {
      return <LoadingOutlined style={{ fontSize: "24px", color: "#2e81f7" }} />
    } else if (chartStatus.status === ChartStatusEnum.NoData) {
      return <Alert message="Data not found" type="warning" showIcon />
    } else if (chartStatus.status === ChartStatusEnum.UnLimit) {
      return <Alert message="Display limit" type="warning" showIcon />
    } else if (chartStatus.status === ChartStatusEnum.LoadError) {
      return <Alert message={chartStatus.msg} type="error" showIcon />
    } else {
      return <Alert message="Success" type="success" showIcon />
    }
  }

  render() {
    const stats = StoreManager.ChartStore.statsCache.get(chartID)

    return (
      <div>
        <Card size="small">
          <Row gutter={[4, 4]}>
            <Col span={24}>
              <Form layout="inline"
                style={{
                  width: "calc(100%)",
                  textAlign: "left",
                }} >
                <Form.Item label="Database">
                  <DatabaseNameSelect />
                </Form.Item>
                <Form.Item label="Namespace">
                </Form.Item>
              </Form>
            </Col>
          </Row>
          <Row gutter={[4, 4]}>
            <Col span={24}>
              <TextArea value={this.state.ql}
                onChange={(value) => this.setState({ ql: value.target.value })}
                autoSize={{ minRows: 5, maxRows: 5 }}
                placeholder="Please input LinDB query language" />
            </Col>
          </Row>
          <Row gutter={[4, 4]}>
            <Col span={24}>
              <Form
                layout="inline"
                style={{
                  width: "calc(100%)",
                  textAlign: "center",
                }}
              >
                <Form.Item>
                  <Button type="primary" icon={<SearchOutlined />} onClick={() => this.searchQL()}>Search</Button>
                </Form.Item>
                <Form.Item>
                  <Button type="danger" icon={<CloseOutlined />}>Clear</Button>
                </Form.Item>
              </Form>
            </Col>
          </Row>
        </Card>
        <Card>
          <Tabs defaultActiveKey="1" size="small" animated={false} tabBarExtraContent={this.renderChartStatus()}>
            <TabPane tab="Data" key="1">
              <Metric
                id={chartID}
                type="line"
                height={480}
                unit={UnitEnum.None}
              />
            </TabPane>
            {stats && (
              <TabPane tab="Explain" key="2">
                <ExplainStats stats={stats} />
              </TabPane>
            )}
          </Tabs>
        </Card>
      </div>
    )
  }
}