<template>
  <div class="organiztion-management-container">
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item v-for="(item, index) in breadcrumbs" :key="index" @click.native="breadcrumbClick(item)">{{ item.name }}</el-breadcrumb-item>
    </el-breadcrumb>
    <el-row v-loading="loading" class="content-container">
      <el-row v-if="tableType=='organize'" class="content">
        <div class="btns">
          <div class="search"><el-input v-model="queryName" size="small" placeholder="请输入搜索内容" clearable/></div>
          <el-button type="primary" size="small" icon="el-icon-search" @click="refreshTable()">搜索</el-button>
          <el-button type="primary" size="small" icon="el-icon-plus" @click="addOrganize('organize')">新增</el-button>
          <el-button type="primary" size="small" icon="el-icon-delete" @click="dels('organize')">删除</el-button>
          <el-upload
            ref="upload"
            :show-file-list="false"
            :on-success="uploadComplete"
            class="upload-demo"
            action="/api/v1/saveExcelOrgPeople">
            <el-button type="primary" size="small" icon="el-icon-upload2">导入</el-button>
          </el-upload>
          <el-button type="primary" size="small" icon="el-icon-download" @click="downModel">下载模板</el-button>
        </div>
        <div>
          <el-table :data="tableData.list" border stripe max-height="616" @selection-change="handleSelectionChange">
            <el-table-column type="selection" width="55"/>
            <el-table-column prop="orgName" label="名称">
              <template slot-scope="scope">
                <span class="column-table-click" @click="handleColumnClick(scope.row)">{{ scope.row.orgName }}</span>
              </template>
            </el-table-column>
            <el-table-column prop="orgState" label="状态"/>
            <el-table-column prop="orgType" label="类型"/>
            <el-table-column prop="orgAddress" label="地址"/>
            <el-table-column prop="orgContact" label="联系方式"/>
            <el-table-column label="操作">
              <template slot-scope="scope">
                <el-button size="mini" @click="handleEdit(scope.$index, scope.row, 'organize')">编辑</el-button>
                <el-button size="mini" type="danger" @click="handleDelete(scope.$index, scope.row, 'organize')">删除</el-button>
              </template>
            </el-table-column>
          </el-table>
        </div>
        <el-pagination
          :total="tableData.total"
          :current-page="tableData.pageNum"
          :page-sizes="[10, 15, 20, 50]"
          :page-size="tableData.pageSize"
          layout="total, sizes, prev, pager, next, jumper"
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
          @prev-click="handleCurrentChange"
          @next-click="handleCurrentChange"/>
      </el-row>
      <el-container v-else class="content ground">
        <el-aside width="400px">
          <el-row>
            <span class="depart-add-btn" title="新增部门" @click="addDepart()"><i class="el-icon-circle-plus"/></span>
          </el-row>
          <el-tree
            :data="treeData"
            :props="defaultProps"
            :default-expand-all="true"
            :highlight-current="true"
            :expand-on-click-node="false"
            node-key="id"
            @node-click="handleNodeClick">
            <span slot-scope="{ node, data }" class="custom-tree-node">
              <span>{{ node.label }}</span>
              <span class="btns">
                <el-button
                  type="text"
                  size="mini"
                  @click.native.stop="() => addDepart(data)">
                  添加
                </el-button>
                <el-button
                  type="text"
                  size="mini"
                  @click.native.stop="() => editDepart(data)">
                  修改
                </el-button>
              </span>
            </span>
          </el-tree>
        </el-aside>
        <el-main>
          <div class="btns">
            <div class="search"><el-input v-model="queryName" size="small" placeholder="请输入搜索内容" clearable/></div>
            <el-button type="primary" size="small" icon="el-icon-search" @click="refreshTable()">搜索</el-button>
            <el-button type="primary" size="small" icon="el-icon-plus" @click.native="addPeople">新增</el-button>
            <el-button type="primary" size="small" icon="el-icon-delete" @click="dels('people')">删除</el-button>
          </div>
          <el-table :data="tableData.list" border stripe max-height="616" @selection-change="handleSelectionChange">
            <el-table-column type="selection" width="55"/>
            <el-table-column prop="orgUserName" label="名称">
              <template slot-scope="scope">
                <span>{{ scope.row.orgUserName }}</span>
              </template>
            </el-table-column>
            <el-table-column prop="orgUserState" label="状态"/>
            <el-table-column prop="orgUserLeave" label="级别"/>
            <el-table-column prop="orgUserConnect" label="联系方式"/>
            <el-table-column label="操作">
              <template slot-scope="scope">
                <el-button size="mini" @click="handleEdit(scope.$index, scope.row, 'people')">编辑</el-button>
                <el-button size="mini" type="danger" @click="handleDelete(scope.$index, scope.row, 'people')">删除</el-button>
              </template>
            </el-table-column>
          </el-table>
          <el-pagination
            :total="tableData.total"
            :current-page="tableData.pageNum"
            :page-sizes="[10, 15, 20, 50]"
            :page-size="tableData.pageSize"
            layout="total, sizes, prev, pager, next, jumper"
            @size-change="handleSizeChange"
            @current-change="handleCurrentChange"
            @prev-click="handleCurrentChange"
            @next-click="handleCurrentChange"/>
        </el-main>
      </el-container>
    </el-row>

    <el-dialog :visible.sync="dialogFormVisible" :title="(tableType, dialogAction) | titleFilter(tableType, dialogAction)" width="550px" @closed="closeDialog">
      <el-form v-show="tableType==='organize'" ref="organizeForm" :rules="rules" :model="organizeForm" label-position="left" size="small" label-width="120px" style="width: 400px; margin-left:50px;">
        <el-form-item label="机构编码" required>
          <el-input v-model="organizeForm.orgCode"/>
        </el-form-item>
        <el-form-item label="机构名称" required>
          <el-input v-model="organizeForm.orgName"/>
        </el-form-item>
        <el-form-item label="机构地址" required>
          <el-input v-model="organizeForm.orgAddress"/>
        </el-form-item>
        <el-form-item label="机构联系方式" required>
          <el-input v-model="organizeForm.orgContact"/>
        </el-form-item>
        <el-form-item label="机构状态">
          <el-select v-model="organizeForm.orgState" placeholder="请选择">
            <el-option label="有效" value="有效"/>
            <el-option label="无效" value="无效"/>
          </el-select>
        </el-form-item>
        <el-form-item label="机构类型" required>
          <el-input v-model="organizeForm.orgType"/>
        </el-form-item>
      </el-form>
      <el-form v-show="tableType==='depart'" ref="departForm" :model="departForm" label-position="left" size="small" label-width="120px" style="width: 400px; margin-left:50px;">
        <el-form-item label="部门名称" required>
          <el-input v-model="departForm.orgDepartmentName"/>
        </el-form-item>
        <el-form-item label="部门说明" required>
          <el-input v-model="departForm.orgDepartmentDescription" type="textarea"/>
        </el-form-item>
      </el-form>
      <el-form v-show="tableType==='people'" ref="peopleForm" :model="peopleForm" label-position="left" size="small" label-width="120px" style="width: 400px; margin-left:50px;">
        <el-form-item label="人员编号" required>
          <el-input v-model="peopleForm.orgUserCode"/>
        </el-form-item>
        <el-form-item label="人员名称" required>
          <el-input v-model="peopleForm.orgUserName"/>
        </el-form-item>
        <el-form-item label="人员职级" required>
          <el-input v-model="peopleForm.orgUserLeave"/>
        </el-form-item>
        <el-form-item label="人员说明" required>
          <el-input v-model="peopleForm.orgUserDescript"/>
        </el-form-item>
        <el-form-item label="人员状态" required>
          <el-select v-model="peopleForm.orgUserState" placeholder="请选择">
            <el-option label="有效" value="有效"/>
            <el-option label="无效" value="无效"/>
          </el-select>
        </el-form-item>
        <el-form-item label="人员联系方式" required>
          <el-input v-model="peopleForm.orgUserConnect"/>
        </el-form-item>
        <el-form-item label="证书开始时间" required>
          <el-date-picker v-model="peopleForm.certificatesGmtStart" type="date" value-format="yyyy-MM-dd" placeholder="选择日期"/>
        </el-form-item>
        <el-form-item label="证书结束时间" required>
          <el-date-picker v-model="peopleForm.certificatesGmtEnd" type="date" value-format="yyyy-MM-dd" placeholder="选择日期"/>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="dialogFormVisible = false">取消</el-button>
        <el-button type="primary" @click.native="dialogComplete">确定</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import {
  getOrganize,
  getDepart,
  getPeople,
  saveOrg,
  saveOrgDepartment,
  saveOrgPeople,
  delOrg,
  delOrgDepartment,
  delOrgPeople,
  getExcelOrgPeople,
  updateOrg,
  updateOrgDepartment,
  updateOrgPeople
} from '@/api/organizionManage.js'
export default {
  filters: {
    titleFilter(dialogAction, type) {
      const action = dialogAction === 'add' ? '新增' : '修改'
      const titleMap = {
        organize: '机构',
        depart: '部门',
        people: '人员'
      }
      return `${action}${titleMap[type]}`
    }
  },
  data() {
    return {
      breadcrumbs: [
        {
          api: getOrganize,
          type: 'organize',
          name: '机构列表'
        }
      ],
      loading: false,
      queryName: '',
      treeData: [],
      defaultProps: {
        children: 'children',
        label: 'orgDepartmentName'
      },
      tableData: { list: [], total: 0, pageNum: 1, pageSize: 20 },
      tableType: 'organize',
      queryApiMap: {
        organize: getOrganize,
        depart: getDepart,
        people: getPeople
      },
      addApiMap: {
        organize: saveOrg,
        depart: saveOrgDepartment,
        people: saveOrgPeople
      },
      delApiMap: {
        organize: delOrg,
        depart: delOrgDepartment,
        people: delOrgPeople
      },
      editApiMap: {
        organize: updateOrg,
        depart: updateOrgDepartment,
        people: updateOrgPeople
      },
      dialogFormVisible: false,
      dialogAction: 'add',
      organizeForm: { orgCode: '', orgName: '', orgAddress: '', orgContact: '', orgState: '有效', orgType: '' },
      departForm: {
        orgCode: '',
        orgDepartmentParentId: '',
        orgDepartmentName: '',
        orgDepartmentDescription: ''
      },
      peopleForm: {
        orgUserCode: '',
        orgCode: '',
        orgDepartmentId: '',
        orgUserName: '',
        orgUserLeave: '',
        orgUserDescript: '',
        orgUserState: '有效',
        orgUserConnect: '',
        certificatesGmtStart: '',
        certificatesGmtEnd: ''
      },
      rules: {},
      multipleSelection: []
    }
  },
  mounted() {
    this.$nextTick(() => {
      this.refreshTable()
    })
  },
  methods: {
    // 页显示条数变化
    handleSizeChange(size) {
      this.tableData.pageSize = size
      this.refreshTable()
    },
    // 页码变化
    handleCurrentChange(currentPage) {
      this.tableData.pageNum = currentPage
      this.refreshTable()
    },
    // 刷新表格
    refreshTable(item) {
      if (!item) {
        item = this.breadcrumbs[this.breadcrumbs.length - 1]
      }
      const query = {
        pageNum: this.tableData.pageNum,
        pageSize: this.tableData.pageSize
      }
      if (this.tableType === 'depart') {
        query.orgCode = item.orgCode
      } else if (this.tableType === 'people') {
        query.orgPeopleName = this.queryName
        query.id = item.id
      } else {
        query.orgName = this.queryName
      }
      this.loading = true
      item.api
        .call(this, query)
        .then(res => {
          this.loading = false
          if (res.data) {
            if (this.tableType === 'depart') {
              this.resetTable()
              this.treeData = this.getTreeData(res.data.data)
            } else {
              this.tableData = res.data.data
              this.pageNum = res.data.data.pageNum
              this.pageSize = res.data.data.pageSize
              this.tatal = res.data.data.total
            }
          }
        })
        .catch(res => {
          this.loading = false
        })
    },
    // 获取树结构数据
    getTreeData(data) {
      const treeData = []
      const tmpMap = {}
      const key = 'id'
      const parentKey = 'orgDepartmentParentId'
      const childKey = 'children'

      // 先把数组整理成map的形式
      for (let i = 0, l = data.length; i < l; i++) {
        // key为 对象的"id"的值， value就是就该对象
        tmpMap[data[i][key]] = data[i]
      }

      // 遍历，组织成子孙节点
      for (let i = 0, l = data.length; i < l; i++) {
        // 查找当前节点的父节点是否存在，如果存在就把当前节点放入到父节点的子孙列表中
        if (tmpMap[data[i][parentKey]] && data[i][key] !== data[i][parentKey]) {
          if (!tmpMap[data[i][parentKey]][childKey]) {
            tmpMap[data[i][parentKey]][childKey] = []
          }
          tmpMap[data[i][parentKey]][childKey].push(data[i])
        } else {
          // 如果不存在就直接放入到一个新的列表中
          treeData.push(data[i])
        }
      }
      return treeData
    },
    // 重置表格数据
    resetTable() {
      this.tableData.pageNum = 1
      this.tableData.list = []
    },
    // 点击面包屑
    breadcrumbClick(item) {
      this.tableType = item.type
      this.queryName = ''
      const index = this.breadcrumbs.findIndex(breadcrumb => breadcrumb.name === item.name)
      this.breadcrumbs.splice(index + 1, this.breadcrumbs.length - index - 1)
      this.resetTable()
      this.refreshTable(item)
    },
    // 点击表格列
    handleColumnClick(row) {
      this.tableType = 'depart'
      this.queryName = ''

      const item = {
        api: this.queryApiMap.depart,
        type: 'depart',
        name: row.orgName,
        orgId: row.orgId,
        orgCode: row.orgCode
      }
      this.breadcrumbs.push(item)
      this.resetTable()
      this.refreshTable(item)
    },
    // 部门节点点击
    handleNodeClick(data, node) {
      this.tableType = 'people'
      this.queryName = ''
      const item = {
        api: this.queryApiMap.people,
        type: 'people',
        name: data.orgDepartmentName,
        id: data.id
      }
      if (this.breadcrumbs.length > 2) {
        this.breadcrumbs.splice(this.breadcrumbs.length - 1, 1)
      }
      this.breadcrumbs.push(item)
      this.refreshTable()
    },
    // 上传完成
    uploadComplete() {
      this.$message({
        message: '导入成功',
        type: 'success'
      })
      this.breadcrumbClick(this.breadcrumbs[0])
    },
    // 新增组织
    addOrganize(tableType) {
      this.dialogAction = 'add'
      this.tableType = tableType
      this.dialogFormVisible = true
      if (this.tableType === 'depart') {
        this.departForm.orgCode = this.breadcrumbs[1].orgCode
      }
    },
    // 新增子部门
    addDepart(data) {
      this.dialogAction = 'add'
      this.tableType = 'depart'
      this.dialogFormVisible = true
      this.departForm.orgCode = this.breadcrumbs[1].orgCode
      if (data) {
        this.departForm.orgDepartmentParentId = data.id
      }
    },
    // 修改部门
    editDepart(data) {
      this.dialogAction = 'edit'
      this.tableType = 'depart'
      Object.assign(this.departForm, data)
      this.dialogFormVisible = true
    },
    // 新增人员
    addPeople() {
      this.dialogAction = 'add'
      this.tableType = 'people'
      if (this.breadcrumbs.length < 3) {
        this.$message({
          message: '请选择部门',
          type: 'warning'
        })
        return
      }

      this.tableType = 'people'
      this.peopleForm.orgCode = this.breadcrumbs[1].orgCode
      this.peopleForm.orgDepartmentId = this.breadcrumbs[2].id
      this.dialogFormVisible = true
    },
    // 关闭对话框回调
    closeDialog() {
      this.organizeForm = { orgCode: '', orgName: '', orgAddress: '', orgContact: '', orgState: '有效', orgType: '' }
      this.departForm = {
        orgCode: '',
        orgDepartmentParentId: '',
        orgDepartmentName: '',
        orgDepartmentDescription: ''
      }
      this.peopleForm = {
        orgUserCode: '',
        orgCode: '',
        orgDepartmentId: '',
        orgUserName: '',
        orgUserLeave: '',
        orgUserDescript: '',
        orgUserState: '有效',
        orgUserConnect: '',
        certificatesGmtStart: '',
        certificatesGmtEnd: ''
      }
      this.$refs[`${this.tableType}Form`].resetFields()
    },
    dialogComplete() {
      if (this.dialogAction === 'add') {
        this.addAction()
      } else {
        this.editAction()
      }
    },
    // 新增
    addAction() {
      let params
      if (this.tableType === 'organize') {
        params = this.organizeForm
      } else if (this.tableType === 'depart') {
        params = this.departForm
      } else {
        params = this.peopleForm
      }

      const api = this.addApiMap[this.tableType]
      this.$refs[`${this.tableType}Form`].validate(valid => {
        if (valid) {
          this.dialogFormVisible = false
          this.loading = true
          api(params)
            .then(res => {
              this.loading = false
              if (res.data && res.data.message === 'success') {
                this.$message({
                  message: '新增成功',
                  type: 'success'
                })
                this.refreshTable()
              }
            })
            .catch(res => {
              this.loading = false
              console.log(res)
            })
        } else {
          return false
        }
      })
    },
    // 编辑
    editAction() {
      let params
      if (this.tableType === 'organize') {
        params = this.organizeForm
      } else if (this.tableType === 'depart') {
        params = this.departForm
      } else {
        params = this.peopleForm
      }

      const api = this.editApiMap[this.tableType]
      this.$refs[`${this.tableType}Form`].validate(valid => {
        if (valid) {
          this.dialogFormVisible = false
          this.loading = true
          api(params)
            .then(res => {
              this.loading = false
              if (res.data && res.data.message === 'success') {
                this.$message({
                  message: '修改成功',
                  type: 'success'
                })
                this.refreshTable()
              }
            })
            .catch(res => {
              this.loading = false
              console.log(res)
            })
        } else {
          return false
        }
      })
    },
    // 打开编辑对话框
    handleEdit(index, row, tableType) {
      this.dialogAction = 'edit'
      this.tableType = tableType
      if (this.tableType === 'organize') {
        Object.assign(this.organizeForm, row)
      } else if (this.tableType === 'depart') {
        Object.assign(this.departForm, row)
      } else {
        Object.assign(this.peopleForm, row)
      }
      this.dialogFormVisible = true
    },
    // 删除
    handleDelete(index, row, tableType) {
      this.tableType = tableType
      const arr = []
      if (tableType === 'organize') {
        arr.push(row.orgCode)
      } else {
        arr.push(row.orgUserCode)
      }
      this.$confirm('是否删除?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      })
        .then(() => {
          this.loading = true
          this.delApiMap[tableType](arr)
            .then(res => {
              this.loading = false
              if (res.status === 200) {
                this.$message({
                  type: 'success',
                  message: '删除成功!'
                })
                this.refreshTable()
              }
            })
            .catch(res => {
              this.loading = false
            })
        })
        .catch(() => {})
    },
    // 批量删除
    dels(tableType, arr) {
      if (!tableType) {
        tableType = this.tableType
      }
      if (!arr) {
        arr = []
        this.multipleSelection.forEach(row => {
          if (tableType === 'organize') {
            arr.push(row.orgCode)
          } else {
            arr.push(row.orgUserCode)
          }
        })
      }

      this.$confirm('是否删除?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      })
        .then(() => {
          this.loading = true
          this.delApiMap[tableType](arr)
            .then(res => {
              this.loading = false
              if (res.status === 200) {
                this.$message({
                  type: 'success',
                  message: '删除成功!'
                })
                this.refreshTable()
              }
            })
            .catch(res => {
              this.loading = false
            })
        })
        .catch(() => {})
    },
    // 下载模板
    downModel() {
      getExcelOrgPeople()
        .then(res => {
          if (res.status === 200) {
            const downloadElement = document.createElement('a')
            // 创建下载的链接
            downloadElement.href = res.data.data
            // 下载后文件名
            document.body.appendChild(downloadElement)
            downloadElement.click()
            // 点击下载
            document.body.removeChild(downloadElement)
          } else {
            this.$message({
              message: '服务器连接异常',
              type: 'warning'
            })
          }
        })
        .catch(res => {
          this.$message({
            message: '服务器连接异常',
            type: 'warning'
          })
        })
    },
    // 选中变化
    handleSelectionChange(val) {
      this.multipleSelection = val
    }
  }
}
</script>

<style lang='scss'>
$activeColor: #42a0f8;
.organiztion-management-container {
  padding: 16px;

  .el-breadcrumb {
    font-size: 16px;
    font-weight: bold;
    height: 36px;
    line-height: 36px;

    .el-breadcrumb__item {
      .el-breadcrumb__inner {
        cursor: pointer;
      }
    }
  }

  .search {
    display: inline-block;
    position: relative;
  }

  .btns {
    display: inline-block;
    position: relative;
    margin-bottom: 16px;

    .el-button {
      margin-left: 6px;
    }

    .upload-demo {
      display: inline-block;
    }
  }

  .content-container {
    margin-top: 16px;
    height: calc(100vh - 168px);
    font-size: 14px;

    .content {
      height: 100%;

      .el-aside {
        height: 100%;

        .depart-add-btn {
          color: $activeColor;
          cursor: pointer;
          font-size: 18px;
          float: right;
          margin-right: 16px;
        }

        .el-tree {
          .el-tree-node__content {
            position: relative;
            height: 30px;
            line-height: 30px;

            .custom-tree-node {
              .btns {
                display: none;
                height: 30px;
                line-height: 30px;
                position: absolute;
                right: 16px;
              }
            }

            &:hover {
              .custom-tree-node {
                .btns {
                  display: inline-block;
                }
              }
            }
          }
        }
      }

      .el-main {
        padding-top: 6px;
        border-left: 1px solid #ddd;
        height: 100%;
      }
    }

    .el-table__body-wrapper {
      &::-webkit-scrollbar {
        width: 8px;
        height: 8px;
      }
      /*正常情况下滑块的样式*/

      &::-webkit-scrollbar-thumb {
        background-color: rgba(0, 0, 0, 0.05);
        border-radius: 10px;
      }
      /*鼠标悬浮在该类指向的控件上时滑块的样式*/

      &:hover::-webkit-scrollbar-thumb {
        background-color: rgba(0, 0, 0, 0.2);
        border-radius: 10px;
      }
      /*鼠标悬浮在滑块上时滑块的样式*/

      &::-webkit-scrollbar-thumb:hover {
        background-color: rgba(0, 0, 0, 0.4);
      }
      /*正常时候的主干部分*/

      &::-webkit-scrollbar-track {
        border-radius: 10px;
        background-color: white;
      }
      /*鼠标悬浮在滚动条上的主干部分*/

      &::-webkit-scrollbar-track:hover {
        background-color: rgba(0, 0, 0, 0.01);
      }
    }

    .column-table-click {
      cursor: pointer;
      color: $activeColor;
    }

    .el-pagination {
      margin-top: 16px;
    }
  }
}
</style>
