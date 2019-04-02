<template>
  <div class="app-container">
    <div class="filter-container">
      <el-input
        v-prems="'function:query'"
        :placeholder="$t('table.keywords')"
        v-model="listQuery.keywords"
        style="width: 200px;"
        class="filter-item"
        @keyup.enter.native="handleFilter"
      />
      <el-button
        v-waves
        v-prems="'function:query'"
        class="filter-item"
        type="primary"
        icon="el-icon-search"
        @click="handleFilter"
      >{{ $t('table.search') }}</el-button>
      <el-button
        v-prems="'function:add'"
        class="filter-item"
        style="margin-left: 10px;"
        type="primary"
        icon="el-icon-edit"
        @click="handleCreate"
      >{{ $t('table.add') }}</el-button>
      <el-button
        v-waves
        v-prems="'function:delete'"
        :disabled="multipleSelection.length<1"
        :loading="deleteLoading"
        class="filter-item"
        type="primary"
        icon="el-icon-delete"
        @click="handleModifyStatus({})"
      >{{ $t('table.delete') }}</el-button>
    </div>
    <div class="pipt-container">
      <el-table
        v-loading="listLoading"
        :key="tableKey"
        :data="list"
        fit
        border
        highlight-current-row
        style="width: 100%;"
        @selection-change="handleSelectionChange"
        @sort-change="sortChange"
      >
        <el-table-column type="selection" width="55"/>
        <el-table-column :label="$t('table.functionName')" prop="functionName" align="center">
          <template slot-scope="scope">
            <span>{{ scope.row.functionName }}</span>
          </template>
        </el-table-column>
        <el-table-column :label="$t('table.functionCode')" prop="functionCode" align="center">
          <template slot-scope="scope">
            <span>{{ scope.row.functionCode }}</span>
          </template>
        </el-table-column>
        <el-table-column
          :label="$t('table.functionDescript')"
          prop="functionDescript"
          align="center"
        >
          <template slot-scope="scope">
            <span>{{ scope.row.functionDescription }}</span>
          </template>
        </el-table-column>
        <el-table-column
          :label="$t('table.actions')"
          align="center"
          width="300"
          class-name="small-padding fixed-width"
        >
          <template slot-scope="scope">
            <el-button
              v-prems="'function:edit'"
              type="primary"
              size="mini"
              @click="handleUpdate(scope.row)"
            >{{ $t('table.edit') }}</el-button>
            <el-button
              v-prems="'function:delete'"
              size="mini"
              type="danger"
              @click="handleModifyStatus(scope.row,'deleted')"
            >{{ $t('table.delete') }}</el-button>
          </template>
        </el-table-column>
      </el-table>

      <pagination
        v-show="total>0"
        :total="total"
        :page.sync="listQuery.page"
        :limit.sync="listQuery.limit"
        @pagination="getList"
      />
    </div>
    <el-dialog :title="textMap[dialogStatus]" :visible.sync="dialogFormVisible" width="550px">
      <el-form
        ref="dataForm"
        :rules="rules"
        :model="temp"
        label-position="left"
        label-width="80px"
        style="width: 400px; margin-left:50px;"
      >
        <el-form-item :label="$t('table.functionName')" prop="functionName">
          <el-input v-model="temp.functionName"/>
        </el-form-item>
        <el-form-item :label="$t('table.functionCode')" prop="functionCode">
          <el-input v-model="temp.functionCode"/>
        </el-form-item>
        <el-form-item :label="$t('table.functionDescript')" prop="functionDescription">
          <el-input
            :autosize="{ minRows: 2, maxRows: 4}"
            v-model="temp.functionDescription"
            type="textarea"
            placeholder="Please input"
          />
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="dialogFormVisible = false">{{ $t('table.cancel') }}</el-button>
        <el-button
          type="primary"
          @click="dialogStatus==='create'?createData():updateData()"
        >{{ $t('table.confirm') }}</el-button>
      </div>
    </el-dialog>

    <el-dialog :visible.sync="dialogPvVisible" title="Reading statistics">
      <el-table :data="pvData" border fit highlight-current-row style="width: 100%">
        <el-table-column prop="key" label="Channel"/>
        <el-table-column prop="pv" label="Pv"/>
      </el-table>
      <span slot="footer" class="dialog-footer">
        <el-button type="primary" @click="dialogPvVisible = false">{{ $t('table.confirm') }}</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
import { fetchList, updateFunction, addFunction, deleteFunction } from '@/api/function'
import waves from '@/directive/waves' // Waves directive
import prems from '@/directive/prems' // prems directive
import Pagination from '@/components/Pagination' // Secondary package based on el-pagination
import store from '@/store/index'
import { mapGetters } from 'vuex'
const calendarTypeOptions = [
  { key: 'CN', display_name: 'China' },
  { key: 'US', display_name: 'USA' },
  { key: 'JP', display_name: 'Japan' },
  { key: 'EU', display_name: 'Eurozone' }
]
// arr to obj ,such as { CN : "China", US : "USA" }
const calendarTypeKeyValue = calendarTypeOptions.reduce((acc, cur) => {
  acc[cur.key] = cur.display_name
  return acc
}, {})

export default {
  name: 'UserList',
  components: { Pagination },
  directives: { waves, prems },
  filters: {
    statusFilter(status) {
      const statusMap = {
        published: 'success',
        draft: 'info',
        deleted: 'danger'
      }
      return statusMap[status]
    },
    typeFilter(type) {
      return calendarTypeKeyValue[type]
    }
  },
  data() {
    return {
      tableKey: 0,
      ids: '',
      list: [],
      total: 0,
      listLoading: true,
      listQuery: {
        page: 1,
        limit: 20,
        keywords: ''
      },
      importanceOptions: [1, 2, 3],
      calendarTypeOptions,
      sortOptions: [{ label: 'ID Ascending', key: '+id' }, { label: 'ID Descending', key: '-id' }],
      statusOptions: [{ name: '启用', value: 1 }, { name: '禁用', value: 0 }],
      allUserRole: [],
      showReviewer: false,
      temp: {
        functionName: '',
        functionDescription: '',
        functionCode: ''
      },
      dialogFormVisible: false,
      dialogStatus: '',
      textMap: {
        update: '编辑功能点',
        create: '增加功能点'
      },
      multipleSelection: [],
      dialogPvVisible: false,
      pvData: [],
      rules: {
        functionName: [{ required: true, message: `功能名称不能为空`, trigger: 'blur' }],
        functionCode: [{ required: true, message: `功能码不能为空`, trigger: 'blur' }],
        functionDescription: [{ required: true, message: `功能描述不能为空`, trigger: 'blur' }]
      },
      downloadLoading: false,
      deleteLoading: false
    }
  },
  computed: {
    ...mapGetters(['get_listname']),
    arrButton() {
      const permsList = store.state.perms.permsList
      if (permsList.length > 0) {
        const lists = store.state.perms.permsList.map(item => item.functionCode)
        if (lists.indexOf('function:edit') === -1 && lists.indexOf('function:delete') === -1) {
          return false
        } else {
          return true
        }
      } else {
        return false
      }
    }
  },
  created() {
    // this.set_listname(111)
    this.getList()
  },
  methods: {
    getList() {
      this.listLoading = true
      fetchList(this.listQuery).then(response => {
        if (response.data.status === 200) {
          this.list = response.data.data.list
          this.total = response.data.data.total
          // Just to simulate the time of the request
          setTimeout(() => {
            this.listLoading = false
          }, 500)
        } else {
          this.$message({
            message: response.data.message,
            type: 'warning'
          })
        }
      })
    },
    handleFilter() {
      this.listQuery.page = 1
      this.getList()
    },
    handleSelectionChange(val) {
      this.multipleSelection = val
    },
    handleModifyStatus(row) {
      this.$confirm('此操作将永久删除该功能点, 是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      })
        .then(() => {
          this.ids = ''
          if (row.functionId) {
            this.ids = row.functionId
          } else {
            this.ids = this.multipleSelection.map(item => item.functionId).join(',')
          }
          deleteFunction({ ids: this.ids }).then(response => {
            if (response.data.status === 200) {
              this.getList()
              this.$message({
                message: response.data.message,
                type: 'success'
              })
            } else {
              this.$message({
                message: response.data.message,
                type: 'warning'
              })
            }
          })
        })
        .catch(() => {
          this.$message({
            type: 'info',
            message: '已取消删除'
          })
        })
    },
    sortChange(data) {
      const { prop, order } = data
      if (prop === 'id') {
        this.sortByID(order)
      }
    },
    sortByID(order) {
      if (order === 'ascending') {
        this.listQuery.sort = '+id'
      } else {
        this.listQuery.sort = '-id'
      }
      this.handleFilter()
    },
    resetTemp() {
      this.temp = {
        functionName: '',
        functionDescription: ''
      }
    },
    handleCreate() {
      this.resetTemp()
      this.dialogStatus = 'create'
      this.dialogFormVisible = true
      this.$nextTick(() => {
        this.$refs['dataForm'].clearValidate()
      })
    },
    createData() {
      this.$refs['dataForm'].validate(valid => {
        if (valid) {
          const params = {
            functionCode: this.temp.functionCode,
            functionName: this.temp.functionName,
            functionDescription: this.temp.functionDescription
          }
          addFunction(params).then(response => {
            if (response.data.status === 200) {
              this.getList()
              this.dialogFormVisible = false
              this.$notify({
                title: '成功',
                message: '创建成功',
                type: 'success',
                duration: 2000
              })
            } else {
              this.$message({
                message: response.data.message,
                type: 'warning'
              })
            }
          })
        }
      })
    },
    handleUpdate(row) {
      this.temp = Object.assign({}, row)
      this.dialogFormVisible = true
      this.$nextTick(() => {
        this.$refs['dataForm'].clearValidate()
      })
    },
    updateData() {
      this.$refs['dataForm'].validate(valid => {
        if (valid) {
          const tempData = Object.assign({}, this.temp)
          const params = {
            functionId: tempData.functionId,
            functionName: tempData.functionName,
            functionDescription: tempData.functionDescription,
            functionCode: tempData.functionCode
          }
          updateFunction(params).then(response => {
            if (response.data.status === 200) {
              this.getList()
              this.dialogFormVisible = false
              this.$notify({
                title: '成功',
                message: '更新成功',
                type: 'success',
                duration: 2000
              })
            } else {
              this.$message({
                message: response.data.message,
                type: 'warning'
              })
            }
          })
        }
      })
    }
  }
}
</script>
<style lang="scss">
.el-table tr th,
td .cell {
  text-align: center;
}
</style>
