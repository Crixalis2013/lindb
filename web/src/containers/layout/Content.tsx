import { Layout } from 'antd'
import ChartTooltip from 'components/metric/ChartTooltip'
import Database from 'containers/admin/Database'
import Storage from 'containers/admin/Storage'
import OverviewPage from 'containers/home/Overview'
import StorageClusterDetailPage from 'containers/home/StorageClusterDetail'
import Footer from 'containers/layout/Footer'
import Header from 'containers/layout/Header'
import SiderMenu from 'containers/layout/SiderMenu'
import Runtime from 'containers/monitoring/Runtime'
import SearchPage from 'containers/query/MetricDataSearch'
import * as React from 'react'
import { Route, Switch } from 'react-router-dom'

const { Content: AntDContent } = Layout

interface ContentProps {
}

interface ContentStatus {
}

export default class Content extends React.Component<ContentProps, ContentStatus> {
  constructor(props: ContentProps) {
    super(props)
    this.state = {}
  }

  render() {
    return (
      <Layout className="lindb-sider-layout">
        {/* Sider Bar Menu */}
        <SiderMenu />

        {/* Content Area */}
        <Layout className="lindb-layout">
          <AntDContent className="lindb-content-container">
            <Header />

            <ChartTooltip />

            <Switch>
              <Route exact={true} path="/" component={OverviewPage} />
              <Route exact={true} path="/storage/cluster/:clusterName" component={StorageClusterDetailPage} />
              <Route exact={true} path="/search" component={SearchPage} />
              <Route exact={true} path="/monitoring/runtime" component={Runtime} />
              <Route exact={true} path="/admin/storage" component={Storage} />
              <Route exact={true} path="/admin/database" component={Database} />
            </Switch>
          </AntDContent>

          <Footer sider={true} />
        </Layout>
      </Layout>
    )
  }
}