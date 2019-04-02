<template>
  <div class="app-container">
    <div class="filter-container">
      <el-input v-prems="'role:query'" :placeholder="$t('table.keywords')" v-model="listQuery.keywords" style="width: 200px;" class="filter-item" @keyup.enter.native="handleFilter"/>
      <el-button v-waves v-prems="'role:query'" class="filter-item" type="primary" icon="el-icon-search" @click="handleFilter">{{ $t('table.search') }}</el-button>
      <el-button v-prems="'role:add'" class="filter-item" style="margin-left: 10px;" type="primary" icon="el-icon-edit" @click="handleCreate">{{ $t('table.add') }}</el-button>
      <el-button v-prems="'role:delete'" v-waves :disabled="multipleSelection.length<1" :loading="deleteLoading" class="filter-item" type="primary" icon="el-icon-delete" @click="handleModifyStatus({})">{{ $t('table.delete') }}</el-button>
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
        @sort-change="sortChange">
        <el-table-column type="selection" width="55"/>
        <el-table-column :label="$t('table.roleId')" prop="roleId" sortable="custom" align="center" width="150">
          <template slot-scope="scope">
            <span>{{ scope.row.roleId }}</span>
          </template>
        </el-table-column>
        <el-table-column :label="$t('table.roleName')" prop="roleName" align="center">
          <template slot-scope="scope">
            <span>{{ scope.row.roleName }}</span>
          </template>
        </el-table-column>
        <el-table-column :label="$t('table.roleDescription')" prop="roleDescription" align="center">
          <template slot-scope="scope">
            <span>{{ scope.row.roleDescription }}</span>
          </template>
        </el-table-column>
        <el-table-column :label="$t('table.gmtCreate')" prop="gmtCreate" sortable="custom" align="center" width="200" >
          <template slot-scope="scope">
            <span>{{ scope.row.gmtCreate }}</span>
          </template>
        </el-table-column>
        <el-table-column :label="$t('table.gmtModified')" prop="gmtModified" sortable="custom" align="center" width="200" >
          <template slot-scope="scope">
            <span>{{ scope.row.gmtModified }}</span>
          </template>
        </el-table-column>
        <el-table-column v-if="arrButton" :label="$t('table.actions')" align="center" width="300" class-name="small-padding fixed-width">
          <template slot-scope="scope">
            <el-button v-prems="'role:edit'" type="primary" size="mini" @click="handleUpdate(scope.row)">{{ $t('table.edit') }}</el-button>
            <el-button v-prems="'role:delete'" size="mini" type="danger" @click="handleModifyStatus(scope.row,'deleted')">{{ $t('table.delete') }}
            </el-button>
          </template>
        </el-table-column>
      </el-table>

      <pagination v-show="total>0" :total="total" :page.sync="listQuery.page" :limit.sync="listQuery.limit" @pagination="getList" />
    </div>
    <el-dialog :title="textMap[dialogStatus]" :visible.sync="dialogFormVisible" class="dialog-width">
      <el-form ref="dataForm" :rules="rules" :model="temp" label-position="left" label-width="80px" style="width: 400px; margin-left:50px;">
        <el-form-item :label="$t('table.roleName')" prop="roleName">
          <el-input v-model="temp.roleName"/>
        </el-form-item>
        <el-form-item :label="$t('table.roleDescription')" prop="roleDescription">
          <el-input v-model="temp.roleDescription"/>
        </el-form-item>
      </el-form>
      <el-row :gutter="20" >
        <el-col :span="6"><div class="grid-content bg-purple">
          <el-tree
            ref="tree"
            :data="treeData"
            :default-expanded-keys="[2, 3]"
            :props="defaultProps"
            :default-checked-keys="defaultCheckedList"
            show-checkbox
            node-key="menuId"/></div></el-col>
        <el-col :span="18"><div class="grid-content bg-purple">
          <el-transfer
            v-model="defaultTransfer"
            :data="transferData"
            :props="{
              key: 'functionId',
              label: 'functionName'
            }"
            :right-default-checked="defaultTransfer"
            :titles="['功能点', '绑定功能点']"
            :button-texts="['到左边', '到右边']"
            :format="{noChecked: '${total}',hasChecked: '${checked}/${total}'}"
            filterable
            style="text-align: left; display: inline-block"
            @change="handleChange"/>
        </div></el-col>
      </el-row>
      <div slot="footer" class="dialog-footer">
        <el-button @click="dialogFormVisible = false">{{ $t('table.cancel') }}</el-button>
        <el-button type="primary" @click="dialogStatus==='create'?createData():updateData()">{{ $t('table.confirm') }}</el-button>
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
import {
  getAllUserRolePage,
  allMenu,
  getAllUserRole,
  getUserRoleDetailsByRoleId,
  addRoleDetailsByRoleId,
  deleteRoles,
  allFunction,
  updateRoleDetailsByRoleId
} from '@/api/article'
import store from '@/store/index'
import waves from '@/directive/waves' // Waves directive
import prems from '@/directive/prems' // Waves directive
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
  name: 'RoleList',
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
      roleId: '',
      listLoading: true,
      listQuery: {
        page: 1,
        limit: 20,
        keywords: ''
      },
      treeData: [],
      defaultCheckedList: [],
      defaultProps: {
        children: 'children',
        label: 'menuDescription'
      },
      transferData: [],
      defaultTransfer: [],
      importanceOptions: [1, 2, 3],
      calendarTypeOptions,
      sortOptions: [{ label: 'ID Ascending', key: '+id' }, { label: 'ID Descending', key: '-id' }],
      statusOptions: [{ name: '启用', value: 1 }, { name: '禁用', value: 0 }],
      allUserRole: [],
      showReviewer: false,
      temp: {
        roleName: '',
        roleDescription: '',
        functions: [],
        menus: []
      },
      dialogFormVisible: false,
      dialogStatus: '',
      textMap: {
        update: '编辑',
        create: '添加'
      },
      multipleSelection: [],
      dialogPvVisible: false,
      pvData: [],
      rules: {
        roleName: [{ required: true, message: `角色名称不能为空`, trigger: 'blur' }],
        roleDescription: [{ required: true, message: `角色描述不能为空`, trigger: 'blur' }]
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
        if (lists.indexOf('role:edit') === -1 && lists.indexOf('role:delete') === -1) {
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
      getAllUserRolePage(this.listQuery).then(response => {
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
    handleChange(value, direction, movedKeys) {
      console.log(value, direction, movedKeys)
    },
    handleSelectionChange(val) {
      this.multipleSelection = val
    },
    handleModifyStatus(row) {
      this.$confirm('此操作将永久删除该角色, 是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      })
        .then(() => {
          this.ids = ''
          if (row.roleId) {
            this.ids = row.roleId
          } else {
            this.ids = this.multipleSelection.map(item => item.roleId).join(',')
          }
          deleteRoles({ ids: this.ids }).then(response => {
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
        remark: '',
        userName: '',
        userRealName: '',
        userPhone: '',
        isEnabled: '',
        password: ''
      }
    },
    async handleCreate() {
      this.defaultCheckedList = []
      this.defaultTransfer = []
      await this.resetTemp()
      this.dialogStatus = 'create'
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
      await allMenu().then(response => {
        if (response.data.status === 200) {
          this.treeData = response.data.data
        } else {
          this.$message({
            message: response.data.message,
            type: 'warning'
          })
        }
      })
      await allFunction().then(response => {
        if (response.data.status === 200) {
          this.transferData = response.data.data
          this.dialogFormVisible = true
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
          const tempData = Object.assign({}, this.temp)
          const functions = []
          this.transferData.forEach(element => {
            if (this.defaultTransfer.indexOf(element.functionId) !== -1) {
              functions.push({
                createUserId: element.createUserId,
                functionCode: element.functionCode,
                functionDescription: element.functionDescription,
                functionId: element.functionId,
                functionName: element.functionName,
                gmtCreate: element.gmtCreate,
                gmtModified: element.gmtModified,
                isDelete: element.isDelete,
                updateUserId: element.updateUserId
              })
            }
          })
          const menus = this.$refs.tree.getCheckedNodes(false, true) // 获取选中的菜单
          const params = {
            functions: functions,
            menus: menus,
            roleDescription: tempData.roleDescription,
            roleName: tempData.roleName
          }
          addRoleDetailsByRoleId(params).then(() => {
            this.getList()
            this.dialogFormVisible = false
            this.$notify({
              title: '成功',
              message: '创建成功',
              type: 'success',
              duration: 2000
            })
          })
        }
      })
    },
    traverseTree(node) {
      if (!node) {
        return
      }
      this.traverseNode(node)
      if (node.children && node.children.length > 0) {
        for (const i of node.children) {
          this.traverseTree(i)
          console.log()
        }
      }
    },
    // 获取角色的所有子节点，即角色的菜单权限（能看到的菜单）
    traverseNode(node) {
      if (node.children.length < 1) {
        this.defaultCheckedList.push(node.menuId)
      }
    },
    async handleUpdate(row) {
      this.temp = Object.assign({}, row)
      this.dialogStatus = 'update'
      this.roleId = row.roleId
      await getUserRoleDetailsByRoleId({ roleId: row.roleId }).then(response => {
        if (response.data.status === 200) {
          this.defaultCheckedList = []
          // response.data.data.menus.forEach(element => {
          //   this.defaultCheckedList.push(element.menuId)
          // })
          this.traverseTree(response.data.data.menus[0])
          this.defaultTransfer = []
          response.data.data.functions.forEach(element => {
            this.defaultTransfer.push(element.functionId)
          })
        } else {
          this.$message({
            message: response.data.message,
            type: 'warning'
          })
        }
      })
      await allMenu().then(response => {
        if (response.data.status === 200) {
          this.treeData = response.data.data
        } else {
          this.$message({
            message: response.data.message,
            type: 'warning'
          })
        }
      })
      await allFunction().then(response => {
        if (response.data.status === 200) {
          this.transferData = response.data.data
          this.dialogFormVisible = true
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
          const tempData = Object.assign({}, this.temp)
          const functions = []
          this.transferData.forEach(element => {
            if (this.defaultTransfer.indexOf(element.functionId) !== -1) {
              functions.push({
                createUserId: element.createUserId,
                functionCode: element.functionCode,
                functionDescription: element.functionDescription,
                functionId: element.functionId,
                functionName: element.functionName,
                gmtCreate: element.gmtCreate,
                gmtModified: element.gmtModified,
                isDelete: element.isDelete,
                updateUserId: element.updateUserId
              })
            }
          })
          const menus = this.$refs.tree.getCheckedNodes(false, true) // 获取选中的菜单
          const params = {
            id: this.roleId,
            functions: functions,
            menus: menus,
            roleDescription: tempData.roleDescription,
            roleName: tempData.roleName
          }
          updateRoleDetailsByRoleId(params).then(response => {
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
.dialog-width .el-dialog {
  min-width: 800px;
}
</style>
