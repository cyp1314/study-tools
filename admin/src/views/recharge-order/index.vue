<template>
  <el-card style="margin:10px;">
    <el-form :inline="true" :model="queryParams">
      <el-form-item>
        <el-select v-model="queryParams.status" placeholder="订单状态" clearable style="width:130px">
          <el-option label="待支付" value="pending" />
          <el-option label="已支付" value="paid" />
          <el-option label="已退款" value="refunded" />
          <el-option label="失败" value="failed" />
        </el-select>
      </el-form-item>
      <el-form-item>
        <el-input v-model="queryParams.userId" placeholder="用户ID" clearable style="width:120px" />
      </el-form-item>
      <el-form-item>
        <el-button type="primary" @click="requestData">搜索</el-button>
      </el-form-item>
    </el-form>
  </el-card>
  <el-card style="margin:10px;">
    <table-action title="充值订单" />
    <el-table :data="table.data" v-loading="table.loading" border style="width: 100%">
      <el-table-column prop="id" label="ID" width="70" />
      <el-table-column prop="user_id" label="用户ID" width="80" />
      <el-table-column prop="nickname" label="用户昵称" width="120">
        <template #default="scope">{{ scope.row.nickname || '-' }}</template>
      </el-table-column>
      <el-table-column prop="order_no" label="订单号" width="200" show-overflow-tooltip />
      <el-table-column prop="points" label="积分" width="80" />
      <el-table-column prop="amount" label="金额(元)" width="100">
        <template #default="scope">¥{{ parseFloat(scope.row.amount).toFixed(2) }}</template>
      </el-table-column>
      <el-table-column prop="status" label="状态" width="90">
        <template #default="scope">
          <el-tag :type="statusTagMap[scope.row.status]">{{ statusLabelMap[scope.row.status] }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="payment_method" label="支付方式" width="90" />
      <el-table-column prop="paid_at" label="支付时间" width="170">
        <template #default="scope">{{ scope.row.paid_at || '-' }}</template>
      </el-table-column>
      <el-table-column prop="created_at" label="创建时间" width="170" />
      <el-table-column fixed="right" label="操作" width="160">
        <template #default="scope">
          <el-button v-if="scope.row.status === 'pending'" type="success" :link="true" @click="handleMarkPaid(scope.row)">确认支付</el-button>
          <el-button v-if="scope.row.status === 'paid'" type="warning" :link="true" @click="handleRefund(scope.row)">退款</el-button>
        </template>
      </el-table-column>
    </el-table>
    <el-pagination class="pagination-right"
      @current-change="requestData"
      v-model:current-page="table.pagination.currentPage"
      :page-size="table.pagination.pageSize"
      layout="total, prev, pager, next, jumper"
      :total="table.pagination.total"
    />
  </el-card>
</template>

<script setup name="rechargeOrderIndex">
import { reactive, onMounted } from 'vue'
import { getRechargeOrderList, markRechargeOrderPaid, refundRechargeOrder } from '@/api/admin'
import TableAction from '@/components/Table/TableAction.vue'
import notice from '@/utils/notice'
import { ElMessageBox } from 'element-plus'

const queryParams = reactive({ status: '', userId: '' })

const statusLabelMap = { pending: '待支付', paid: '已支付', refunded: '已退款', failed: '失败' }
const statusTagMap = { pending: 'warning', paid: 'success', refunded: 'info', failed: 'danger' }

const table = reactive({
  data: [],
  pagination: { currentPage: 1, pageSize: 20, total: 0 },
  loading: false,
})

const requestData = () => {
  table.loading = true
  const params = { page: table.pagination.currentPage, pageSize: table.pagination.pageSize }
  if (queryParams.status) params.status = queryParams.status
  if (queryParams.userId) params.userId = queryParams.userId
  getRechargeOrderList(params).then(res => {
    const data = res.data.data
    table.data = data.list
    table.pagination.total = data.total
    table.loading = false
  }).catch(() => { table.loading = false })
}

onMounted(() => requestData())

const handleMarkPaid = (row) => {
  ElMessageBox.confirm(`确认标记订单 ${row.order_no} 为已支付？将自动充值 ${row.points} 积分`, '确认支付', { type: 'warning' }).then(() => {
    markRechargeOrderPaid(row.id, { paymentMethod: 'admin' }).then(() => {
      notice.editSuccess('已标记为已支付')
      requestData()
    })
  }).catch(() => {})
}

const handleRefund = (row) => {
  ElMessageBox.confirm(`确认退款订单 ${row.order_no}？将扣回 ${row.points} 积分`, '确认退款', { type: 'warning' }).then(() => {
    refundRechargeOrder(row.id, { remark: '管理员退款' }).then(() => {
      notice.editSuccess('已退款')
      requestData()
    })
  }).catch(() => {})
}
</script>
