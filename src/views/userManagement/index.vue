<template>
  <div class="app-container">
    <div class="filter-container">
      <el-input v-prems="'user:query'" :placeholder="$t('table.keywords')" v-model="listQuery.keywords" style="width: 200px;" class="filter-item" @keyup.enter.native="handleFilter"/>
      <el-button v-waves v-prems="'user:query'" class="filter-item" type="primary" icon="el-icon-search" @click="handleFilter">{{ $t('table.search') }}</el-button>
      <el-button v-waves v-prems="'user:add'" class="filter-item" style="margin-left: 10px;" type="primary" icon="el-icon-edit" @click="handleCreate">{{ $t('table.add') }}</el-button>
      <el-button v-waves v-prems="'user:export'" :loading="downloadLoading" class="filter-item" type="primary" icon="el-icon-download" @click="handleDownload">{{ $t('table.export') }}</el-button>
      <el-button v-waves v-prems="'user:import'" :loading="importLoading" class="filter-item" type="primary" icon="el-icon-upload2" @click="handleImport">{{ $t('table.Import') }}</el-button>
      <el-button v-waves v-prems="'user:delete'" :disabled="multipleSelection.length<1" :loading="deleteLoading" class="filter-item" type="primary" icon="el-icon-delete" @click="handleModifyStatus({})">{{ $t('table.delete') }}</el-button>
      <!-- <el-checkbox v-model="showReviewer" class="filter-item" style="margin-left:15px;" @change="tableKey=tableKey+1">{{ $t('table.reviewer') }}</el-checkbox> -->
    </div>
    <!-- <el-scrollbar> -->
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
        @sort-change="sortChange">
        <el-table-column type="selection" width="55" />
        <el-table-column :label="$t('table.userId')" prop="id" sortable="custom" align="center" width="150">
          <template slot-scope="scope">
            <span>{{ scope.row.id }}</span>
          </template>
        </el-table-column>
        <el-table-column :label="$t('table.realName')" prop="realName" align="center">
          <template slot-scope="scope">
            <span>{{ scope.row.realName }}</span>
          </template>
        </el-table-column>
        <el-table-column :label="$t('table.userName')" prop="userName" align="center">
          <template slot-scope="scope">
            <span>{{ scope.row.userName }}</span>
          </template>
        </el-table-column>
        <el-table-column :label="$t('table.roleName')" prop="roleName" align="center">
          <template slot-scope="scope">
            <span>{{ scope.row.roleName }}</span>
          </template>
        </el-table-column>
        <el-table-column :label="$t('table.departmentName')" prop="departmentName" align="center">
          <template slot-scope="scope">
            <span>{{ scope.row.departmentName }}</span>
          </template>
        </el-table-column>
        <el-table-column :label="$t('table.mobileNumber')" prop="mobileNumber" align="center" width="200">
          <template slot-scope="scope">
            <span>{{ scope.row.mobileNumber }}</span>
          </template>
        </el-table-column>
        <!-- <el-table-column :label="$t('table.gmtCreate')" prop="gmtCreate" sortable="custom" align="center" width="200" >
          <template slot-scope="scope">
            <span>{{ scope.row.gmtCreate }}</span>
          </template>
        </el-table-column>
        <el-table-column :label="$t('table.gmtModified')" prop="gmtModified" sortable="custom" align="center" width="200" >
          <template slot-scope="scope">
            <span>{{ scope.row.gmtModified }}</span>
          </template>
        </el-table-column> -->
        <el-table-column :label="$t('table.isEnabled')" prop="isEnabled" sortable="custom" align="center" width="100" >
          <template slot-scope="scope">
            <span>{{ scope.row.isEnabled?'启用':'禁用' }}</span>
          </template>
        </el-table-column>
        <el-table-column v-if="arrButton" :label="$t('table.actions')" align="center" width="300">
          <template slot-scope="scope">
            <el-button v-prems="'user:edit'" type="primary" size="mini" @click="handleUpdate(scope.row)">{{ $t('table.edit') }}</el-button>
            <el-button v-prems="'user:delete'" size="mini" type="danger" @click="handleModifyStatus(scope.row,'deleted')">{{ $t('table.delete') }}
            </el-button>
          </template>
        </el-table-column>
      </el-table>

      <pagination v-show="total>0" :total="total" :page.sync="listQuery.page" :limit.sync="listQuery.limit" @pagination="getList" />
    </div>
    <!-- </el-scrollbar> -->
    <el-dialog :title="textMap[dialogStatus]" :visible.sync="dialogFormVisible" width="550px">
      <el-form ref="dataForm" :rules="rules" :model="temp" label-position="left" label-width="80px" style="width: 400px; margin-left:50px;">
        <el-form-item :label="$t('table.userName')" prop="userName">
          <el-input v-model="temp.userName"/>
        </el-form-item>
        <el-form-item :label="$t('table.realName')" prop="realName">
          <el-input v-model="temp.realName"/>
        </el-form-item>
        <el-form-item v-if="dialogStatus!=='create'" :label="$t('table.isEnabled')" prop="isEnabled">
          <el-select v-model="temp.isEnabled" class="filter-item" placeholder="Please select" style="width:100%">
            <el-option v-for="(item,index) in statusOptions" :key="index" :label="item.name" :value="item.value"/>
          </el-select>
        </el-form-item>
        <el-form-item :label="$t('table.mobileNumber')" prop="mobileNumber">
          <el-input v-model="temp.mobileNumber"/>
        </el-form-item>
        <el-form-item v-if="dialogStatus==='create'" :label="$t('table.password')" prop="password">
          <el-input v-model="temp.password"/>
        </el-form-item>
        <el-form-item :label="$t('table.roles')" prop="roleId">
          <el-select v-model="temp.roleId" multiple class="filter-item" placeholder="Please select" style="width:100%">
            <el-option v-for="item in allUserRole" :key="item.roleId" :label="item.roleDescription" :value="item.roleId"/>
          </el-select>
        </el-form-item>
        <el-form-item :label="$t('table.departments')" prop="departmentId">
          <el-select v-model="temp.departmentId" class="filter-item" placeholder="Please select" style="width:100%">
            <el-option v-for="item in allDepartment" :key="item.departmentId" :label="item.departmentName" :value="item.departmentId"/>
          </el-select>
        </el-form-item>
        <!-- <el-form-item :label="$t('table.remark')">
          <el-input :autosize="{ minRows: 2, maxRows: 4}" v-model="temp.remark" type="textarea" placeholder="Please input"/>
        </el-form-item> -->
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="dialogFormVisible = false">{{ $t('table.cancel') }}</el-button>
        <el-button :loading="isSubmit" type="primary" @click="dialogStatus==='create'?createData():updateData()">{{ $t('table.confirm') }}</el-button>
      </div>
    </el-dialog>
    <el-dialog :visible.sync="importLoading" :title="$t('table.Import')">
      <el-upload
        :on-success="handleImportFile"
        :show-file-list="false"
        action="/api/v1/addExcelUser"
        class="upload-demo"
        accept="application/vnd.ms-excel"
        style="display:inline-block;">
        <el-button size="small" class="upload-stamp" type="primary">导入</el-button>
      </el-upload>
      <el-button v-waves class="filter-item" type="primary" icon="el-icon-download" @click="handleDownloadTemp">{{ $t('table.downloadTemp') }}</el-button>
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
import {
  fetchList,
  fetchPv,
  getUserDetailsByUserId,
  getAllUserRole,
  getAllDepartment,
  updateSysUser,
  addSysUser,
  deleteSysUser,
  exportUserTempleExcel,
  exportUserToleExcel
} from '@/api/article'
import store from '@/store/index'
import waves from '@/directive/waves' // Waves directive
import prems from '@/directive/prems' // prems directive
import Pagination from '@/components/Pagination' // Secondary package based on el-pagination

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
      allDepartment: [],
      showReviewer: false,
      temp: {
        remark: '',
        roleId: [],
        departmentId: '',
        userName: '',
        realName: '',
        mobileNumber: '',
        isEnabled: ''
      },
      dialogFormVisible: false,
      isSubmit: false,
      dialogStatus: '',
      textMap: {
        update: '编辑',
        create: '新建'
      },
      multipleSelection: [],
      dialogPvVisible: false,
      pvData: [],
      rules: {
        userName: [{ required: true, message: `用户名不能为空`, trigger: 'blur' }],
        isEnabled: [{ required: true, message: `状态不能为空`, trigger: 'change' }],
        mobileNumber: [{ required: true, message: `联系电话不能为空`, trigger: 'blur' }],
        password: [{ required: true, message: `密码不能为空`, trigger: 'blur' }],
        roleId: [{ required: true, message: `角色组不能为空`, trigger: 'change' }],
        departmentId: [{ required: true, message: `部门不能为空`, trigger: 'change' }]
      },
      downloadLoading: false,
      importLoading: false,
      deleteLoading: false
    }
  },
  computed: {
    arrButton() {
      const permsList = store.state.perms.permsList
      if (permsList.length > 0) {
        const lists = store.state.perms.permsList.map(item => item.functionCode)
        if (lists.indexOf('user:edit') === -1 && lists.indexOf('user:delete') === -1) {
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
      this.$confirm('此操作将永久删除该用户, 是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      })
        .then(() => {
          this.ids = ''
          if (row.id) {
            this.ids = row.id
          } else {
            this.ids = this.multipleSelection.map(item => item.id).join(',')
          }
          deleteSysUser({ ids: this.ids }).then(response => {
            if (response.data.status === 200) {
              this.getList()
              this.$message({
                message: response.data.message,
                type: 'success'
              })
            } else {
              this.getList()
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
        remark: '',
        roleId: [],
        departmentId: '',
        userName: '',
        realName: '',
        mobileNumber: '',
        isEnabled: 1,
        password: ''
      }
    },
    async handleCreate() {
      await this.resetTemp()
      this.dialogStatus = 'create'
      await getAllUserRole().then(response => {
        if (response.data.status === 200) {
          this.allUserRole = response.data.data
        } else {
          this.$message({
            message: response.data.message,
            type: 'warning'
          })
        }
      })
      await getAllDepartment().then(response => {
        if (response.data.status === 200) {
          this.allDepartment = response.data.data
          this.dialogFormVisible = true
          this.$nextTick(() => {
            this.$refs['dataForm'].clearValidate()
          })
        } else {
          this.$message({
            message: response.data.message,
            type: 'warning'
          })
        }
      })
    },
    createData() {
      this.$refs['dataForm'].validate(valid => {
        if (valid) {
          const role = []
          this.allUserRole.forEach(element => {
            if (this.temp.roleId.indexOf(element.roleId) !== -1) {
              role.push({
                roleId: element.roleId,
                roleName: element.roleName
              })
            }
          })
          const params = {
            userName: this.temp.userName,
            realName: this.temp.realName,
            remark: this.temp.remark,
            mobileNumber: this.temp.mobileNumber,
            role: role,
            password: this.temp.password,
            departmentId: this.temp.departmentId,
            status: this.temp.isEnabled
          }
          addSysUser(params).then(response => {
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
    async handleUpdate(row) {
      this.temp = Object.assign({}, row) // copy obj
      this.dialogStatus = 'update'
      this.$set(this.temp, 'roleId', [])
      await getUserDetailsByUserId({ userId: row.id }).then(response => {
        if (response.data.status === 200) {
          this.$set(this.temp, 'departmentId', response.data.data.departmentId)
          response.data.data.role.forEach(element => {
            this.temp.roleId.push(element.roleId)
          })
        } else {
          this.$message({
            message: response.data.message,
            type: 'warning'
          })
        }
      })
      await getAllDepartment().then(response => {
        if (response.data.status === 200) {
          this.allDepartment = response.data.data
        } else {
          this.$message({
            message: response.data.message,
            type: 'warning'
          })
        }
      })
      await getAllUserRole().then(response => {
        if (response.data.status === 200) {
          this.allUserRole = response.data.data
          this.dialogFormVisible = true
          this.$nextTick(() => {
            this.$refs['dataForm'].clearValidate()
          })
        } else {
          this.$message({
            message: response.data.message,
            type: 'warning'
          })
        }
      })
    },
    updateData() {
      this.$refs['dataForm'].validate(valid => {
        if (valid) {
          this.isSubmit = true
          const tempData = Object.assign({}, this.temp)
          const role = []
          this.allUserRole.forEach(element => {
            if (tempData.roleId.indexOf(element.roleId) !== -1) {
              role.push({
                roleId: element.roleId,
                roleName: element.roleName
              })
            }
          })
          const params = {
            id: tempData.id,
            userName: tempData.userName,
            realName: tempData.realName,
            remark: tempData.remark,
            mobileNumber: tempData.mobileNumber,
            role: role,
            departmentId: tempData.departmentId,
            status: tempData.isEnabled
          }
          updateSysUser(params).then(response => {
            if (response.data.status === 200) {
              this.isSubmit = false
              this.getList()
              this.dialogFormVisible = false
              this.$notify({
                title: '成功',
                message: '更新成功',
                type: 'success',
                duration: 2000
              })
            } else {
              this.isSubmit = false
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
    },
    handleFetchPv(pv) {
      fetchPv(pv).then(response => {
        if (response.data.status === 200) {
          this.pvData = response.data.pvData
          this.dialogPvVisible = true
        } else {
          this.$message({
            message: response.data.message,
            type: 'warning'
          })
        }
      })
    },
    handleDownload() {
      this.downloadLoading = true
      exportUserToleExcel({ keywords: this.listQuery.keywords }).then(response => {
        if (response.data.status === 200) {
          const link = document.createElement('a')
          link.style.display = 'none'
          link.href = response.data.data
          const lists = response.data.data.split('/')
          link.setAttribute('download', lists[lists.length - 1])
          document.body.appendChild(link)
          link.click()
          this.$message({
            message: '导出成功',
            type: 'success'
          })
        } else {
          this.$message({
            message: response.data.message,
            type: 'warning'
          })
        }
      })
      this.downloadLoading = false
    },
    handleImport() {
      this.importLoading = true
      // this.importLoading = false
    },
    handleImportFile(response, file, fileList) {
      if (response.status === 200) {
        let title = ''
        if (response.data[1] > 0) {
          const link = document.createElement('a')
          link.style.display = 'none'
          link.href = response.data[2]
          const lists = response.data[2].split('/')
          link.setAttribute('download', lists[lists.length - 1])
          document.body.appendChild(link)
          link.click()
          title = `导入成功${response.data[0]}条,导入失败${response.data[1]}条,导入失败数据已下载,请查看原由`
        } else {
          title = `导入成功${response.data[0]}条,导入失败${response.data[1]}条`
        }
        this.$message({
          message: title,
          type: 'warning'
        })
        this.getList()
        this.importLoading = false
      } else {
        this.importLoading = false
        this.$message({
          message: response.data.message,
          type: 'warning'
        })
      }
    },
    handleDownloadTemp() {
      exportUserTempleExcel().then(response => {
        if (response.data.status === 200) {
          const link = document.createElement('a')
          link.style.display = 'none'
          link.href = response.data.data
          const lists = response.data.data.split('/')
          link.setAttribute('download', lists[lists.length - 1])
          document.body.appendChild(link)
          link.click()
          this.$message({
            message: '导出模板成功',
            type: 'success'
          })
        } else {
          this.$message({
            message: response.data.message,
            type: 'warning'
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
