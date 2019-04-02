<template>
  <div class="app-container">
    <div class="filter-container">
      <el-input
        v-prems="'department:query'"
        :placeholder="$t('table.keywords')"
        v-model="listQuery.keywords"
        style="width: 200px;"
        class="filter-item"
        @keyup.enter.native="handleFilter"
      />
      <el-button
        v-waves
        v-prems="'department:query'"
        class="filter-item"
        type="primary"
        icon="el-icon-search"
        @click="handleFilter"
      >{{ $t('table.search') }}</el-button>
      <el-button
        v-waves
        v-prems="'department:add'"
        class="filter-item"
        style="margin-left: 10px;"
        type="primary"
        icon="el-icon-edit"
        @click="handleCreate"
      >{{ $t('table.add') }}</el-button>
      <el-button
        v-waves
        v-prems="'department:delete'"
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
        <el-table-column :label="$t('table.departmentId')" prop="departmentId" align="center">
          <template slot-scope="scope">
            <span>{{ scope.row.departmentId }}</span>
          </template>
        </el-table-column>
        <el-table-column :label="$t('table.departmentName')" prop="departmentName" align="center">
          <template slot-scope="scope">
            <span>{{ scope.row.departmentName }}</span>
          </template>
        </el-table-column>
        <el-table-column
          :label="$t('table.departmentDescription')"
          prop="departmentDescription"
          align="center"
        >
          <template slot-scope="scope">
            <span>{{ scope.row.departmentDescription }}</span>
          </template>
        </el-table-column>
        <el-table-column
          v-if="arrButton"
          :label="$t('table.actions')"
          align="center"
          width="300"
          class-name="small-padding fixed-width"
        >
          <template slot-scope="scope">
            <el-button
              v-prems="'department:edit'"
              type="primary"
              size="mini"
              @click="handleUpdate(scope.row)"
            >{{ $t('table.edit') }}</el-button>
            <el-button
              v-prems="'department:delete'"
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
        <el-form-item :label="$t('table.departmentName')" prop="departmentName">
          <el-input v-model="temp.departmentName"/>
        </el-form-item>
        <el-form-item :label="$t('table.departmentDescription')" prop="departmentDescription">
          <el-input
            :autosize="{ minRows: 2, maxRows: 4}"
            v-model="temp.departmentDescription"
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
import { fetchList, updateDepartment, addDepartment, deleteDepartment } from '@/api/department'
import waves from '@/directive/waves' // Waves directive
import prems from '@/directive/prems' // prems directive
import Pagination from '@/components/Pagination' // Secondary package based on el-pagination
import store from '@/store/index'
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
        departmentId: '',
        departmentName: '',
        departmentDescription: ''
      },
      dialogFormVisible: false,
      dialogStatus: '',
      textMap: {
        update: '编辑',
        create: '增加'
      },
      multipleSelection: [],
      dialogPvVisible: false,
      pvData: [],
      rules: {
        departmentName: [{ required: true, message: '部门名称不能为空', trigger: 'blur' }],
        departmentDescription: [{ required: true, message: '部门描述不能为空', trigger: 'blur' }]
      },
      downloadLoading: false,
      deleteLoading: false
    }
  },
  computed: {
    arrButton() {
      const permsList = store.state.perms.permsList
      if (permsList.length > 0) {
        const lists = store.state.perms.permsList.map(item => item.functionCode)
        if (lists.indexOf('department:edit') === -1 && lists.indexOf('department:delete') === -1) {
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
      this.$confirm('此操作将永久删除该部门, 是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      })
        .then(() => {
          this.ids = ''
          if (row.departmentId) {
            this.ids = row.departmentId
          } else {
            this.ids = this.multipleSelection.map(item => item.departmentId).join(',')
          }
          deleteDepartment({ ids: this.ids }).then(response => {
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
        departmentName: '',
        departmentDescription: ''
      }
    },
    async handleCreate() {
      await this.resetTemp()
      this.dialogStatus = 'create'
      this.dialogFormVisible = true
    },
    createData() {
      this.$refs['dataForm'].validate(valid => {
        if (valid) {
          const params = {
            departmentName: this.temp.departmentName,
            departmentDescription: this.temp.departmentDescription
          }
          addDepartment(params).then(response => {
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
            departmentId: tempData.departmentId,
            departmentName: tempData.departmentName,
            departmentDescription: tempData.departmentDescription
          }
          updateDepartment(params).then(response => {
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
    },
    handleDelete(row) {
      this.$notify({
        title: '成功',
        message: '删除成功',
        type: 'success',
        duration: 2000
      })
      const index = this.list.indexOf(row)
      this.list.splice(index, 1)
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
