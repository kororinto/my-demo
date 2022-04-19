<template>
  <div class="mb-page">
    <NavigationBar :title="title" :hasBack="1" v-if="!loading">
      <template
        v-slot:right
        v-if="
          infoForm &&
          infoForm.allowDraft == 1 &&
          (infoForm.teacherId == user.userId || permissionGroupId == 1)
        "
      >
        <div class="color-primary" @click="deleteHomework">删除</div>
      </template>
    </NavigationBar>
    <div class="mb-body" ref="scrollBody" v-show="!loading">
      <div class="homeworkBox">
        <div class="homeworkName">
          <input
            type="text"
            placeholder="请输入作业标题"
            v-model.trim="infoForm.homeworkTitle"
          />
        </div>
        <div class="homeworkContent">
          <u-editor
            class="editor attribute-editor"
            :uContent="infoForm.homeworkRequest"
            uPlaceholder="输入作业要求"
            :uId="id"
            :fileList.sync="uploadList"
            @update:fileList="accessoryList"
            uName="create-editor"
            @onTextChange="onTextChange"
            ref="ck"
            v-if="flag"
          >
          </u-editor>
        </div>
      </div>
      <div class="score" @click="saveScore(1)">
        <p>满分</p>
        <span class="sl choseText">{{ infoForm.grade }}</span>
        <i class="van-icon van-icon-arrow"> </i>
      </div>
      <div class="limit limit2" @click="saveScore(1)">
        <div class="solidBox">发布后不能修改</div>
      </div>
      <div class="doScore" @click="doMark">
        <p>评分方式</p>
        <span class="sl choseText">{{ autoRemark(infoForm.autoRemark) }}</span>
        <i class="van-icon van-icon-arrow"> </i>
      </div>
      <div class="limit" v-if="infoForm.autoRemark == 0" @click="doMark">
        发布后不能修改
      </div>
      <div class="limit limit2" v-else @click="doMark">
        <div class="solidBox">发布后不能修改</div>
      </div>
      <div v-if="infoForm.autoRemark == 2">
        <div class="doScore" @click="saveScore(2)">
          <p>组内互评权重</p>
          <span class="sl choseText">{{ infoForm.interClassWeight }}%</span>
          <i class="van-icon van-icon-arrow"> </i>
        </div>
        <div class="borderBox">
          <div class="solidBorder"></div>
        </div>
        <div class="doScore" @click="saveScore(3)">
          <p>组间互评权重</p>
          <span class="sl choseText">{{ infoForm.interBlockWeight }}%</span>
          <i class="van-icon van-icon-arrow"> </i>
        </div>
        <div class="borderBox">
          <div class="solidBorder"></div>
        </div>
        <div class="doScore" @click="doPeerReviewCountShow">
          <p>每人评价的作业份数</p>
          <span class="sl choseText">{{ infoForm.peerReviewCount }}</span>
          <i class="van-icon van-icon-arrow"> </i>
        </div>
        <div class="limit limit2" @click="doPeerReviewCountShow">
          <div class="solidBox">
            组间互评中每人需评价的作业份数，必须小于单个班级的小组数量
          </div>
        </div>
        <div class="doScore" @click="showRules">
          <div class="limit limit1 limitRule">
            <span
              class="iconfont icon-jieshiyiwen"
            ></span>
            <span>互评规则说明</span>
          </div>
        </div>
      </div>
      <ul class="setting-list">
        <li @click="goChoseDate(1)">
          <div class="desc">开始时间</div>
          <span class="sl choseText">{{
            choseModel.choseStartDate | formatDate
          }}</span>
          <i class="van-icon van-icon-arrow"></i>
        </li>
        <li
          @click="goChoseDate(2)"
          :class="infoForm.autoRemark == 2 ? 'noBorderBox' : ''"
        >
          <div class="desc">提交截止时间</div>
          <span class="sl">
            <span v-if="!choseModel.choseEndDate">请选择</span>
            <span v-else class="choseText">{{
              choseModel.choseEndDate | formatDate
            }}</span>
          </span>
          <i class="van-icon van-icon-arrow"></i>
        </li>
        <li class="limit4Box" v-if="infoForm.autoRemark == 2">
          <div class="limit limit4">互评开始后不能修改</div>
        </li>
        <li v-if="infoForm.autoRemark == 2" @click="goChoseDate(4)">
          <div class="desc">互评截止时间</div>
          <span class="sl">
            <span v-if="!choseModel.peerReviewTime">请选择</span>
            <span v-else class="choseText">{{
              choseModel.peerReviewTime | formatDate
            }}</span>
          </span>
          <i class="van-icon van-icon-arrow"></i>
        </li>
        <li @click="doGradePublishShow">
          <div class="desc">成绩是否公布</div>
          <span class="sl choseText">{{
            gradePublish(infoForm.gradePublish)
          }}</span>
          <i class="van-icon van-icon-arrow"></i>
        </li>
        <li v-if="infoForm.gradePublish == 1" @click="goChoseDate(3)">
          <div class="desc">成绩公布时间</div>
          <span class="sl">
            <span v-if="!choseModel.gradePublishTime">请选择</span>
            <span v-else class="choseText">{{
              choseModel.gradePublishTime | formatDate
            }}</span>
          </span>
          <i class="van-icon van-icon-arrow"></i>
        </li>
        <li v-if="infoForm.autoRemark == 2 && infoForm.homeworkStatus > 4">
          <div class="limit limit1">
            互评已开始，不能修改开始时间和提交截止时间，补交
            的作业将由教师评分。
          </div>
        </li>
      </ul>
      <div class="score" @click="choseClass">
        <p>参与班级</p>
        <div v-if="this.classList.length == 0">
          <span class="sl">选择班级</span>
          <i class="van-icon van-icon-arrow"> </i>
        </div>
        <div v-else>
          <span class="classNameList sl">{{ className }}</span>
          <i class="van-icon van-icon-arrow"> </i>
        </div>
      </div>
      <div class="limit" v-if="this.classList.length == 0" @click="choseClass">
        发布后不能修改
      </div>
      <div class="limit limit2" v-else @click="choseClass">
        <div class="solidBox">发布后不能修改</div>
      </div>
      <div v-if="this.classList.length != 0" class="classListBox">
        <div
          v-for="(item, index) in this.classList"
          :key="item.id"
          class="classBox"
        >
          <div @click="goWorkGroup(item, index)">
            <div class="doScore classScore">
              <span class="className">{{ item.className }}</span>
              <span class="noGroup" v-if="item.groupCount == 0"
                >{{ item.groupCount }}组</span
              >
              <span class="sl" v-else
                >{{ item.groupCount }}组</span
              >
              <i class="van-icon van-icon-arrow"> </i>
            </div>
            <div class="limit stuLimit" v-if="item.unGroupCount != 0">
              有学生未分组
            </div>
          </div>
          <div class="borderBox">
            <div class="solidBorder"></div>
          </div>
        </div>
      </div>
      <div class="score" @click="doSettings">
        <p>高级设置</p>
        <span class="sl"></span>
        <i class="van-icon van-icon-arrow" v-if="!settingFlag"></i>
        <i class="iconfont icon-zhankai" v-if="settingFlag"></i>
      </div>
      <div class="limit" v-if="!settingFlag" @click="doSettings">
        迟交 | 复制粘贴 | 上传附件
      </div>
      <div class="limit limit2" v-if="settingFlag" @click="doSettings">
        <div class="solidBox">迟交 | 复制粘贴 | 上传附件</div>
      </div>
      <div v-if="settingFlag">
        <div class="doScore">
          <p>允许迟交</p>
          <van-switch
            v-model="infoForm.lateShipment"
            active-color="#B4B4F6"
            inactive-color="#dcdee0"
            size="20px"
            :active-value="1"
            :inactive-value="0"
          />
        </div>
        <div class="limit limit3">
          <div class="solidBox">
            允许学生在作业提交截止后补交。补交的作业会显示【迟交】标记；互评作业中，迟交的小组不参与互评，由教师评分。
          </div>
        </div>
        <div class="doScore">
          <p>允许复制粘贴</p>
          <van-switch
            v-model="infoForm.allowCopy"
            active-color="#B4B4F6"
            inactive-color="#dcdee0"
            size="20px"
            :active-value="0"
            :inactive-value="1"
          />
        </div>
        <div class="borderBox">
          <div class="solidBorder"></div>
        </div>
        <div class="doScore">
          <p>允许上传附件</p>
          <van-switch
            v-model="infoForm.allowPostAttach"
            active-color="#B4B4F6"
            inactive-color="#dcdee0"
            size="20px"
            :active-value="1"
            :inactive-value="0"
          />
        </div>
        <div class="limit">
          允许学生写作业时上传附件，支持常见的图片、文档、音视频格式，最多上传5个文件，单个不超过500M。
        </div>
      </div>

      <div
        class="btn-publish"
        v-if="
          this.homeworkId == 0 ||
          (this.infoForm &&
            this.infoForm.allowDraft == 1 &&
            infoForm.teacherId == user.userId)
        "
      >
        <button class="btn-primary" @click="pushHomeWork(2)">发布</button>
      </div>
      <div
        class="btn-saveDrafts"
        v-if="
          this.homeworkId == 0 ||
          (this.infoForm &&
            this.infoForm.allowDraft == 1 &&
            infoForm.teacherId == user.userId)
        "
      >
        <button class="btn-white" @click="pushHomeWork(1)">保存草稿</button>
      </div>
      <div
        class="btnList"
        v-if="
          this.homeworkId != 0 && this.infoForm && this.infoForm.allowDraft != 1
        "
      >
        <div class="cancle btn-white" @click="doBackClick">取消</div>
        <div class="publish btn-primary" @click="pushHomeWork(2)">保存</div>
      </div>
      <div class="assignHomework">
        <van-dialog
          v-model="scoreShow"
          title="满分"
          show-cancel-button
          class="Score"
          confirmButtonText="确定"
          @confirm="doSaveScore(1)"
          @close="reduction(1)"
          @cancel="cancleValue(1)"
          :before-close="onBeforeClose"
        >
          <div
            :class="inputError ? 'errorInputBox' : 'inputBox'"
            v-if="inpScore"
          >
            <van-field
              type="number"
              label=""
              placeholder=""
              v-model="inpGrade"
              @input="doScore($event)"
              ref="input1"
            />
            <!-- <input
              type="number"
              class="inp"
              v-model="inpGrade"
              @input="doScore($event)"
              v-focus
            /> -->
          </div>
          <div class="showinp" v-else @click="doInpScore(1)">
            <span>{{ infoForm.grade }}</span>
            <span class="inpScore">分</span>
          </div>
          <div class="errorMessage" v-if="inputError">请输入1-999的整数</div>
        </van-dialog>
        <van-action-sheet
          v-model="markShow"
          title="评分方式"
          class="choseActonSheet"
        >
          <div v-if="markActions.length != 0">
            <ul v-for="item in markActions" :key="item.index">
              <li
                @click="choseMark(item)"
                :class="item.index == infoForm.autoRemark ? 'active' : ''"
              >
                {{ item.name }}
              </li>
            </ul>
          </div>
        </van-action-sheet>
        <van-action-sheet
          v-model="PeerReviewCountShow"
          title="作业份数"
          class="choseActonSheet"
        >
          <div v-if="peerReviewCountActions.length != 0">
            <ul v-for="item in peerReviewCountActions" :key="item.index">
              <li
                @click="chosePeerReviewCount(item)"
                :class="item.name == infoForm.peerReviewCount ? 'active' : ''"
              >
                {{ item.name }}
              </li>
            </ul>
          </div>
        </van-action-sheet>
        <van-action-sheet
          v-model="gradePublishShow"
          title="是否公布"
          class="choseActonSheet"
        >
          <div v-if="gradePublishActions.length != 0">
            <ul v-for="item in gradePublishActions" :key="item.index">
              <li
                @click="choseGradePublish(item)"
                :class="item.index == infoForm.gradePublish ? 'active' : ''"
              >
                {{ item.name }}
              </li>
            </ul>
          </div>
        </van-action-sheet>
        <van-dialog
          v-model="score1Show"
          title="组内互评所占权重"
          show-cancel-button
          class="Score"
          confirmButtonText="确定"
          @confirm="doSaveScore(2)"
          @close="reduction(2)"
          @cancel="cancleValue(2)"
          :before-close="onBeforeClose"
        >
          <div
            :class="inputError ? 'errorInputBox' : 'inputBox'"
            v-if="inpInterClassWeightFlag"
          >
            <van-field
              type="number"
              label=""
              placeholder=""
              v-model="inpInterClassWeight"
              @input="doInterClassWeight($event)"
              ref="input2"
            />
            <!-- <input
              type="number"
              class="inp"
              v-model="inpInterClassWeight"
              @input="doInterClassWeight"
              v-focus
            /> -->
          </div>

          <div class="showinp" v-else @click="doInpScore(2)">
            <span>{{ inpInterClassWeight }}</span>
            <span class="inpScore">%</span>
          </div>
          <div class="errorMessage" v-if="inputError">请输入0-100的整数</div>
        </van-dialog>
        <van-dialog
          v-model="score2Show"
          title="组间互评所占权重"
          show-cancel-button
          class="Score"
          confirmButtonText="确定"
          @confirm="doSaveScore(3)"
          @close="reduction(3)"
          @cancel="cancleValue(3)"
          :before-close="onBeforeClose"
        >
          <div
            :class="inputError ? 'errorInputBox' : 'inputBox'"
            v-if="inpInterBlockWeightFlag"
          >
            <van-field
              type="number"
              label=""
              placeholder=""
              v-model="inpInterBlockWeight"
              @input="doInterBlockWeight($event)"
              ref="input3"
            />
            <!-- <input
              type="number"
              class="inp"
              v-model="inpInterBlockWeight"
              @input="doInterBlockWeight"
              v-focus
            /> -->
          </div>
          <div class="showinp" v-else @click="doInpScore(3)">
            <span>{{ inpInterBlockWeight }}</span>
            <span class="inpScore">%</span>
          </div>
          <div class="errorMessage" v-if="inputError">请输入0-100的整数</div>
        </van-dialog>
        <van-dialog
          v-model="showRulesFlag"
          title="互评规则说明"
          :show-confirm-button="false"
          class="rules"
          closeOnClickOverlay
          confirmButtonText="确定"
        >
          <div class="rulesContent" ref="rulesContent">
            <div ref="rulesBox">
              <div class="state">
                <div>小组作业互评，包括<b>组内互评</b>和<b>组间互评</b>：</div>
                <div>
                  -<b>组内互评</b>，即学生评价同组其他成员在作业中的表现；
                </div>
                <div>-<b>组间互评</b>，即学生评价其他组的作业。</div>
              </div>
              <div class="time">
                <span class="htitle">互评时间与形式</span>
                <div>
                  <span>-学生互评在作业提交截止之后开始</span
                  ><span class="greyFont"
                    >（注意：如果提交的作业份数不足，作业将转为教师评分）</span
                  >
                </div>
                <div>
                  -未按时提交作业的小组，将不参与组间互评；在作业提交截止之后补交的作业，由教师评分。
                </div>
                <div>
                  -参与互评的学生，须在互评截止之前完成评价任务，否则将被扣除一定比例的分数。
                </div>
                <div>
                  -组内和组间互评，均采用匿名形式，即评价详情仅教师可见。
                </div>
              </div>
              <div class="work">
                <span class="htitle"> 评价任务分配 </span>
                <div>组内互评，学生须为同组其他所有成员打分。</div>
                <div>
                  组间互评，评价任务不跨班分配，学生只能评价本班其他小组的作业。系统从参与互评的小组中，随机为学生分配指定数量的作业。
                </div>
              </div>
              <div class="grad">
                <span class="htitle"> 成绩计算规则 </span>
                <div class="redFont">
                  <b>学生互评得分</b
                  >=组内互评平均得分*组内互评权重+组间互评平均得分*组间互评权重-互评任务未完成的扣分。
                </div>
                <div>
                  -互评任务扣分：学生未完成评价任务，组内互评每缺评一人，或组间互评每缺评一组，将从作业总分中扣除2%。累积扣分上限为20%，扣完为止。
                </div>
                <div>
                  -互评结束后，无人评价的作业，须由教师评分。教师也可以在学生互评得分基础上，重新评分。教师重新评分后，学生个人最终得分，将以教师评分为准。
                </div>
              </div>
            </div>
          </div>
          <div class="close" @click="closeRules">
            <span class="iconfont icon-guanbi1"></span>
          </div>
          <div class="tipsBox" v-show="scrollFlag">下滑显示更多</div>
        </van-dialog>
      </div>
    </div>
    <div v-if="loading" class="loading">
      <van-loading color="#ea5947" />
    </div>
    <Loading :loadingShow="loadingShow" v-if="loadingShow" />
  </div>
</template>
<script>
import { mapGetters, mapActions } from "vuex";
import { saveOrUpdate, publishInfo, systemGroup } from "@/api/homeworkApi";
import { deleteHomework, getCourseRoleInfo } from "@/api/courseApi";
import { formatDate, wordCount } from "@/utils/index.js";
import { buildPath } from "@/utils/file.js";
import { exitApp, refreshCourseHomework } from "@/plugins/cordova/index.js";
import Loading from "../components/loading/loading.vue";
import formatDateFilter from '@/mixins/formatDate.js'
export default {
  name: "assignHomework",
   mixins:[formatDateFilter],
  data() {
    return {
      title: "",
      infoForm: {
        homeworkTitle: "",
        homeworkRequest: "",
        grade: 100,
        autoRemark: 0,
        interClassWeight: 50,
        interBlockWeight: 50,
        peerReviewCount: 3,
        gradePublish: 1,
        allowPostAttach: 1,
        allowCopy: 0,
        lateShipment: 1,
        endTime: "",
        gradePublishTime: "",
        classGroupList: null,
        groupListBef: null,
        peerReviewTime: "",
      },
      inpGrade: 100,
      inpInterClassWeight: 50,
      inpInterBlockWeight: 50,
      flag: false,
      id: "",
      uploadList: [], //附件
      scoreShow: false, //打分弹框
      markShow: false, //评分方式
      score1Show: false,
      score2Show: false,
      showRulesFlag: false, //互评规则展示
      inpScore: false, //输入分数
      inpInterClassWeightFlag: false,
      inpInterBlockWeightFlag: false,
      PeerReviewCountShow: false,
      gradePublishShow: false,
      settingFlag: true,
      markActions: [
        { index: 0, name: "教师评分" },
        { index: 2, name: "学生互评" },
      ],
      peerReviewCountActions: [
        { index: 0, name: "1" },
        { index: 1, name: "2" },
        { index: 2, name: "3" },
        { index: 3, name: "4" },
        { index: 4, name: "5" },
        { index: 5, name: "6" },
        { index: 6, name: "7" },
        { index: 7, name: "8" },
        { index: 8, name: "9" },
        { index: 9, name: "10" },
      ],
      gradePublishActions: [
        { index: 1, name: "公布" },
        { index: 0, name: "不公布" },
      ],
      homeworkId:
        this.$route.query.homeworkId > 0 ? this.$route.query.homeworkId : 0,
      ocId: this.$route.query.ocId,
      selectedClassList: [],
      isPublishing: false,
      scroll: "",
      scrollTo: "",
      scrollFlag: false,
      inputError: false,
      trunTo: false,
      permissionGroupId: "",
      loading: false,
      loadingShow: false,
    };
  },
  created() {
    getCourseRoleInfo(this.ocId).then((data) => {
      this.permissionGroupId = data.permissionGroupId;
    });
    if (this.homeworkId != 0) {
      this.geteditHomeWork();
    } else {
      this.title = "发布作业";
      this.flag = true;
      this.infoForm.homeworkTitle = formatDate(new Date()) + " 小组作业";
      if (!this.choseModel.choseStartDate) {
        var time = +new Date();
        this.setchoseModel({
          userID: this.userID,
          choseStartDate: time,
          choseEndDate: this.choseModel.choseEndDate,
          gradePublishTime: this.choseModel.gradePublishTime,
        });
      }
    }
  },
  mounted() {
    if (this.homeworkId == 0) {
      this.$refs["scrollBody"].addEventListener("scroll",this.bodyScroll);
    }
  },
  activated() {
    var scroll = this.checkScroll;
    this.$refs.scrollBody.scrollTop = scroll;
  },
  methods: {
    onBeforeClose(action, done) {
      if (action == "confirm") {
        return done(false);
      } else {
        return done();
      }
    },
    getsystemGroup(classId) {
      systemGroup({
        classIds: classId,
        ocId: this.ocId,
        userId: this.user.userId,
      })
        .then((res) => {
          this.setGroupList(res.result);
        })
        .catch((res) => {
          console.log(res);
          this.$message({
            type: "error",
            message: res.data,
          });
        });
    },
    geteditHomeWork() {
      this.loading = true;
      publishInfo({
        ocId: this.ocId,
        homeworkId: this.homeworkId,
      })
        .then((res) => {
          this.infoForm = res.result;
          if (res.result.fileList) {
            this.uploadList = buildPath(res.result.fileList);
          } else {
            this.uploadList = [];
          }
          //this.uploadList = res.result.fileList || [];
          if (res.result.allowDraft == 1) {
            var arr = [];
            if (res.result.classGroupList.length > 0) {
              res.result.classGroupList.forEach((item) => {
                arr.push(item.classId);
              });
              this.getsystemGroup(arr);
            }
            this.title = "发布作业";
          } else {
            this.title = "修改作业";
            this.setGroupList({
              classGroupList: res.result.classGroupList,
              groupListBef: res.result.groupListBef,
            });
          }
          this.setCheckClassList(res.result.classGroupList);
          this.setchoseModel({
            userID: this.userID,
            choseStartDate: res.result.startTime,
            choseEndDate: res.result.endTime,
            peerReviewTime: res.result.peerReviewTime,
            gradePublishTime: res.result.gradePublishTime,
          });
          this.flag = true;
          this.loading = false;
          setTimeout(() => {
            //数据加载完成再去执行滚动事件
            this.$refs["scrollBody"].addEventListener(
              "scroll",
              this.bodyScroll
            );
          });
        })
        .catch((res) => {
          console.log(res);
          this.loading = false;
          this.$message({
            type: "error",
            message: res.result,
          });
        });
    },
    accessoryList(val) {
      this.uploadList = val;
    },
    onTextChange: function (content) {
      this.infoForm.homeworkRequest = content;
    },
    bodyScroll() {
      this.scrollTo = this.$refs.scrollBody.scrollTop;
    },
    hasScroll() {
      this.scroll = this.$refs.rulesContent.scrollTop;
      if (
        this.scroll + this.$refs.rulesContent.clientHeight + 50 >
        this.$refs.rulesBox.clientHeight
      ) {
        this.scrollFlag = false;
      } else {
        this.scrollFlag = true;
      }
    },
    choseClass() {
      if (
        this.homeworkId == 0 ||
        (this.infoForm && this.infoForm.allowDraft == 1)
      ) {
        this.setScroll(this.scrollTo);
        this.trunTo = true;
        this.$router.push({
          name: "class",
          query: {
            homeworkId: this.homeworkId,
            ocId: this.ocId,
          },
          params: {
            selectedClassList: this.classList,
          },
        });
      }
    },
    saveScore(type) {
      this.inputError = false;
      if (type == 1) {
        if (
          this.homeworkId == 0 ||
          (this.infoForm && this.infoForm.allowDraft == 1)
        ) {
          this.scoreShow = true;
        }
      } else if (type == 2) {
        this.score1Show = true;
        this.inpInterClassWeight = this.infoForm.interClassWeight;
      } else {
        this.score2Show = true;
        this.inpInterBlockWeight = this.infoForm.interBlockWeight;
      }
    },
    doMark() {
      if (
        this.homeworkId == 0 ||
        (this.infoForm && this.infoForm.allowDraft == 1)
      ) {
        this.markShow = true;
      }
    },
    doPeerReviewCountShow() {
      this.PeerReviewCountShow = true;
    },
    doGradePublishShow() {
      this.gradePublishShow = true;
    },
    choseMark(item) {
      this.infoForm.autoRemark = item.index;
      this.markShow = false;
    },
    chosePeerReviewCount(item) {
      this.infoForm.peerReviewCount = item.name;
      this.PeerReviewCountShow = false;
    },
    choseGradePublish(item) {
      this.infoForm.gradePublish = item.index;
      this.gradePublishShow = false;
    },
    goChoseDate(type) {
      if (type == 3 || type == 4) {
        this.setScroll(this.scrollTo);
        this.trunTo = true;
        this.$router.push({
          path: `/choseDate/${type}/${this.user.userId}?ocId=${this.ocId}&homeworkId=${this.discussionId}`,
        });
      } else {
        if (
          this.infoForm &&
          this.infoForm.allowDraft == 2 &&
          this.homeworkId != 0 &&
          this.infoForm.autoRemark == 2 &&
          this.infoForm.homeworkStatus > 3
        ) {
          return false;
        } else {
          this.setScroll(this.scrollTo);
          this.trunTo = true;
          this.$router.push({
            path: `/choseDate/${type}/${this.user.userId}?ocId=${this.ocId}&homeworkId=${this.discussionId}`,
          });
        }
      }
    },
    showRules() {
      this.showRulesFlag = true;
      this.$nextTick(() => {
        this.$refs["rulesContent"].addEventListener("scroll",this.hasScroll);
        this.hasScroll()
      });
    },
    doInpScore(type) {
      if (type == 1) {
        this.inpScore = true;
        this.$nextTick(() => {
          this.$refs.input1.focus();
        });
      } else if (type == 2) {
        this.inpInterClassWeightFlag = true;
        this.$nextTick(() => {
          this.$refs.input2.focus();
        });
      } else {
        this.inpInterBlockWeightFlag = true;
        this.$nextTick(() => {
          this.$refs.input3.focus();
        });
      }
    },
    doSaveScore(type) {
      if (type == 2) {
        if (this.inpInterClassWeight == "") {
          this.inputError = true;
        } else {
          this.infoForm.interClassWeight = this.inpInterClassWeight;
          this.infoForm.interBlockWeight = 100 - this.infoForm.interClassWeight;
          this.inpInterBlockWeight = 100 - this.infoForm.interClassWeight;
          this.score1Show = false;
        }
      } else if (type == 3) {
        if (this.inpInterBlockWeight == "") {
          this.inputError = true;
        } else {
          this.infoForm.interBlockWeight = this.inpInterBlockWeight;
          this.infoForm.interClassWeight = 100 - this.infoForm.interBlockWeight;
          this.interClassWeight = 100 - this.infoForm.interBlockWeight;
          this.score2Show = false;
        }
      } else {
        if (this.inpGrade == "") {
          this.inputError = true;
        } else {
          this.infoForm.grade = this.inpGrade;
          this.scoreShow = false;
        }
      }
      this.$forceUpdate();
    },
    reduction(type) {
      if (type == 1) {
        this.inpScore = false;
      } else if (type == 2) {
        this.inpInterClassWeightFlag = false;
      } else {
        this.inpInterBlockWeightFlag = false;
      }
    },
    cancleValue(type) {
      setTimeout(() => {
        if (type == 1) {
          this.inpGrade = this.infoForm.grade;
        } else if (type == 2) {
          this.inpInterClassWeight = this.infoForm.interClassWeight;
          this.inpInterBlockWeight = this.infoForm.interBlockWeight;
        } else {
          this.inpInterBlockWeight = this.infoForm.interBlockWeight;
          this.inpInterClassWeight = this.infoForm.interClassWeight;
        }
      }, 300);
    },
    autoRemark(index1) {
      var name;
      this.markActions.forEach((item) => {
        if (item.index == index1) {
          name = item.name;
        }
      });
      return name;
    },
    gradePublish(index1) {
      var name;
      this.gradePublishActions.forEach((item) => {
        if (item.index == index1) {
          name = item.name;
        }
      });
      return name;
    },
    closeRules() {
      this.showRulesFlag = false;
    },
    doSettings() {
      this.settingFlag = !this.settingFlag;
    },
    goWorkGroup(item, index) {
      this.setScroll(this.scrollTo);
      if (
        this.homeworkId == 0 ||
        (this.infoForm &&
          this.infoForm.allowDraft == 1 &&
          this.infoForm.groupType == 3)
      ) {
        this.$router.push({
          path: `/classGroup?ocId=${this.ocId}&classId=${item.classId}`,
        });
      } else if (
        this.infoForm &&
        this.infoForm.allowDraft == 1 &&
        this.infoForm.groupType == 2
      ) {
        this.$router.push({
          path: `/workGroup/${item.classId}/${index}?ocId=${this.ocId}&homeworkId=${this.homeworkId}&type=1`,
        });
      } else {
        this.$router.push({
          path: `/workGroup/${item.classId}/${index}?ocId=${this.ocId}&homeworkId=${this.homeworkId}&type=0`,
        });
      }
    },
    pushHomeWork(type) {
      this.infoForm.startTime = this.choseModel.choseStartDate;
      this.infoForm.endTime = this.choseModel.choseEndDate;
      this.infoForm.gradePublishTime = this.choseModel.gradePublishTime;
      this.infoForm.peerReviewTime = this.choseModel.peerReviewTime;
      this.infoForm.groupListBef = this.checkGroupList.groupListBef;
      this.infoForm.classGroupList = this.checkGroupList.classGroupList;
      this.infoForm.homeworkId = this.homeworkId == 0 ? "" : this.homeworkId;
      this.infoForm.ocId = this.ocId;
      this.infoForm.groupType = 3;
      if (this.isPublishing) {
        return;
      }
      var reg = /^(http|https)/;
      var arr = this.uploadList.every((item) => {
        return reg.test(item.filePath);
      });
      if (!arr) {
        this.$message({
          type: "error",
          message: "附件上传中，请稍后再试！",
        });
        return false;
      }
      if (this.infoForm.homeworkTitle.trim().length < 1) {
        this.$message({
          type: "error",
          message: "请填写作业标题",
        });
        return false;
      }
      if (this.infoForm.homeworkTitle.trim().length > 200) {
        this.$message({
          type: "error",
          message: "作业标题不能超过200个字符",
        });
        return false;
      }
      if (wordCount(this.infoForm.homeworkRequest) > 5000) {
        this.$message({
          type: "error",
          message: "作业要求不能超过5000字符",
        });
        return false;
      }
      if (this.classList.length < 1) {
        this.$message({
          type: "error",
          message: "至少选择1个班级",
        });
        return false;
      }
      if (type == 2) {
        var arr = [];
        this.classList.forEach((item) => {
          arr.push(item.groupCount);
        });
        var minClassGroupCont = Math.min.apply(null, arr);
        if (this.infoForm.PeerReviewCount < minClassGroupCont) {
          this.$message({
            type: "error",
            message: "每人评价的作业份数必须大于单个班级的小组数",
          });
          return false;
        }
        if (this.infoForm.endTime == "") {
          this.$message({
            type: "error",
            message: "请选择提交截止时间",
          });
          return false;
        }
        if (
          this.infoForm.gradePublish == 1 &&
          this.infoForm.gradePublishTime == ""
        ) {
          this.$message({
            type: "error",
            message: "请选择成绩公布时间",
          });
          return false;
        }
        if (
          this.infoForm.autoRemark == 2 &&
          this.infoForm.peerReviewTime == ""
        ) {
          this.$message({
            type: "error",
            message: "请选择互评截止时间",
          });
          return false;
        }
      }

      var reg = /^(http|https)/;
      var arr = this.uploadList.filter((item) => {
        return reg.test(item.filePath);
      });
      this.infoForm.fileList = arr;
      var data = JSON.parse(JSON.stringify(this.infoForm));
      data.allowDraft = type;
      //if(this.infoForm.title.trim().length)
      this.isPublishing = true;
      this.loadingShow = true;
      saveOrUpdate(data)
        .then((res) => {
          setTimeout(() => {
            this.isPublishing = false;
          }, 1000);
          this.loadingShow = false;
          var message = "";
          if (this.homeworkId == 0) {
            if (type == 1) {
              message = "保存成功";
            } else {
              message = "发布成功";
            }
          } else {
            message = "修改成功";
          }
          this.$message({
            type: "success",
            message: message,
          });
          this.infoForm.allowDraft = type;
          setTimeout(() => {
            this.onBackClick();
          }, 1000);
        })
        .catch((res) => {
          this.loadingShow = false;
          this.$message({
            type: "error",
            message: res.message,
          });
          this.isPublishing = false;
        });
    },

    doScore(value) {
      if (value.indexOf(".") > 0) {
        value = value.slice(0, value.indexOf(".") + 0);
        this.inpGrade = value;
      }
      if (this.inpGrade > 999) {
        this.inpGrade = 999;
      }
    },
    doInterClassWeight(value) {
      if (value.indexOf(".") > 0) {
        value = value.slice(0, value.indexOf(".") + 0);
        this.inpInterClassWeight = value;
      }
      if (this.inpInterClassWeight > 100) {
        this.inpInterClassWeight = 100;
      } else if (this.inpInterClassWeight < 0) {
        this.inpInterClassWeight = 0;
      }
    },
    doInterBlockWeight(value) {
      if (value.indexOf(".") > 0) {
        value = value.slice(0, value.indexOf(".") + 0);
        this.inpInterBlockWeight = value;
      }
      if (this.inpInterBlockWeight > 100) {
        this.inpInterBlockWeight = 100;
      } else if (this.inpInterBlockWeight < 0) {
        this.inpInterBlockWeight = 0;
      }
    },
    onBackClick() {
      if (this.$route.meta.isNoHistory) {
        exitApp();
        refreshCourseHomework();
      } else {
        this.$router.back();
      }
    },
    doBackClick() {
      this.$dialog
        .confirm({
          title: "提示",
          message: "确定放弃？",
          confirmButtonText: "确定",
        })
        .then(() => {
          this.onBackClick();
        })
        .catch(() => {
          // on cancel
          return false;
        });
    },
    deleteHomework() {
      this.$dialog
        .confirm({
          title: "提示",
          message: "作业删除后不可恢复，确定删除吗？",
          confirmButtonText: "确定",
        })
        .then(() => {
          // on confirm
          deleteHomework({
            homeworkId: this.homeworkId,
            ocId: this.ocId,
          })
            .then((res) => {
              this.$message({
                type: "success",
                message: "删除成功",
              });
              setTimeout(() => {
                this.onBackClick();
              }, 1000);
            })
            .catch((res) => {
              this.$message({
                type: "error",
                message: res.data,
              });
            });
        })
        .catch(() => {
          console.log("执行确定");
          // on cancel
        });
    },
    getClassGroup() {
      var arr = [];
      this.checkClassList.forEach((item) => {
        arr.push(item.classId);
      });
      systemGroup({
        classIds: arr,
        ocId: this.ocId,
        userId: this.user.userId,
      })
        .then((res) => {
          this.setGroupList(res.result);
        })
        .catch((res) => {
          console.log(res);
          this.$message({
            type: "error",
            message: res.data,
          });
        });
    },
    ...mapActions("choseDate", ["setchoseModel"]),
    ...mapActions("checkClass", ["setCheckClassList"]),
    ...mapActions("groupList", ["setGroupList"]),
    ...mapActions("scroll", ["setScroll"]),
  },
  beforeRouteEnter: (to, from, next) => {
    if (from.name == "publishInfo") {
      next((vm) => {
        vm.geteditHomeWork();
      });
    }
    if (from.name == "classGroup") {
      next((vm) => {
        vm.getClassGroup();
      });
    }
    next();
  },
  computed: {
    ...mapGetters("user", { user: "user" }),
    ...mapGetters("checkClass", { checkClassList: "checkClassList" }),
    ...mapGetters("groupList", { checkGroupList: "checkGroupList" }),
    ...mapGetters("choseDate", { choseModel: "choseModel" }),
    ...mapGetters("scroll", { checkScroll: "checkScroll" }),
    classList() {
      return this.checkGroupList.classGroupList
        ? this.checkGroupList.classGroupList
        : [];
    },
    className() {
      // console.log(this.checkGroupList);
      return this.checkGroupList.classGroupList
        .map((item) => {
          return item.name || item.className;
        })
        .join(",");
    },
  },
  watch: {
    infoForm() {
      this.settingFlag =
        this.infoForm.allowPostAttach == 1 ||
        this.infoForm.allowCopy == 1 ||
        this.infoForm.lateShipment == 1;
    },
  },
  components: {
    UEditor: () => import("../components/uEditor/uEditor.vue"),
    Loading,
  },
};
</script>
<style lang="scss" scoped>
.choseText {
  color: #444 !important;
}
.errorMessage {
  color: #ea5947;
}
.homeworkBox {
  background-color: #fff;

  padding: 0 16px;
  .homeworkName {
    border-bottom: 1px solid #f1f3f7;
    input {
      width: 100%;
      margin: 16px 0;
      border: 0;
    }
    input::placeholder {
      color: #dedede;
    }
  }
  .homeworkContent {
    > p {
      display: flex;
      justify-content: space-between;
      > span {
        font-size: 14px;
        color: #969696;
      }
    }
  }
}

.limit {
  font-size: 14px;
  color: #969696;
  letter-spacing: 0;
  line-height: 21px;
  font-weight: 400;
  padding: 0 16px;
  background-color: #fff;
  margin-top: -15px;
  padding-bottom: 15px;
  .solidBox {
    padding-bottom: 15px;
    border-bottom: 1px solid #e3e3e9;
  }
}
.limit1 {
  padding: 0px;
  margin-top: 0px;
}
.limit2 {
  padding-bottom: 0px;
}
.limit3 {
  padding-bottom: 2px;
}
.limit4 {
  padding: 0px;
}
.limitRule {
  span {
    color: #b4b4f6 !important;
  }
}
.stuLimit {
  color: #f60000;
  text-align: right;
}
.icon-jieshiyiwen{
 color: #B4B4F6;
}
.doScore {
  margin: 0px;
  padding: 0 16px;
  display: flex;
  justify-content: space-between;
  height: 56px;
  line-height: 56px;
  background-color: #fff;
  align-items: center;
  p {
    margin: 0;
  }
  span {
    flex: 1;
    text-align: right;
    margin-right: 5px;
    color: #969696;
    font-size: 15px;
  }
  .noGroup {
    flex: 1;
    text-align: right;
    margin-right: 5px;
    color: #ea5947;
    font-size: 15px;
  }
  i {
    color: #969696;
  }
  .className {
    text-align: left;
    font-size: 16px;
    color: #444444;
    letter-spacing: 0;
    line-height: 24px;
    font-weight: 400;
    overflow: hidden;
    text-overflow: ellipsis;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    line-clamp: 2;
    -webkit-box-orient: vertical;
  }
}
.classScore {
  padding: 0px 16px 0px 26px;
  .className {
    color: #969696;
    font-size: 14px;
  }
  .sl{
    color: #444;
  }
}
.borderBox {
  background-color: #fff;
  padding: 0 16px;
  .solidBorder {
    height: 0.5px;
    width: 100%;
    background-color: #e3e3e9;
  }
}
.score {
  margin: 16px 0px 0px 0px;
  padding: 0 16px;
  display: flex;
  justify-content: space-between;
  height: 56px;
  line-height: 56px;
  background-color: #fff;
  align-items: center;
  .classNameList {
    width: 130px;
    height: 35px;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    display: inline-block;
    color: #444;
  }
  p {
    margin: 0;
  }
  span {
    flex: 1;
    text-align: right;
    margin-right: 5px;
    color: #969696;
    font-size: 15px;
  }
  i {
    color: #969696;
  }
}
.classListBox {
  .classBox:last-child {
    .borderBox {
      display: none;
    }
  }
}
.setting-list {
  background-color: #fff;
  margin-top: 16px;
  li {
    margin: 0 16px;
    display: flex;
    justify-content: space-between;
    align-items: center;
    height: 60px;
    border-bottom: 1px solid #f1f3f7;
    .desc {
      flex: 1;
      margin-right: 24px;
    }
    span {
      flex: 1;
      text-align: right;
      // margin-right: 5px;
      color: #969696;
      font-size: 15px;
      //margin-left: 20px;
    }
    i {
      color: #969696;
    }
  }
  li:last-of-type {
    border: 0;
  }
  .limit4Box {
    margin-top: -10px;
    height: 30px;
  }
  .noBorderBox {
    border-bottom: none;
  }
}
.list1 {
  margin-top: 0px;
}

.btn-publish {
  width: 100%;
  padding: 20px 20px 20px;
  button {
    width: 100%;
    box-shadow: none;
  }
}
.btn-saveDrafts {
  width: 100%;
  padding: 0px 20px 40px;
  button {
    width: 100%;
    border: 1px solid #e3e3e9;
  }
}
.inputBox {
  border: 1px solid #e3e3e9;
  border-radius: 2px;
}
.errorInputBox {
  border: 1px solid #ea5947;
  border-radius: 2px;
}
.inp {
  width: 100%;
  padding: 0px 10px;
  height: 36px;
  outline: none;
  border: none;
}
.showinp {
  width: 100%;
  height: 46px;
  line-height: 46px;
  padding: 0px 16px;
  background: #f1f3f7;
  border-radius: 2px;
  span {
    font-size: 16px;
    color: #444444;
    letter-spacing: 0;
    text-align: center;
    line-height: 24px;
    font-weight: 400;
  }
  .inpScore {
    float: right;
    font-size: 16px;
    color: #cbcbd1;
    letter-spacing: 0;
    text-align: center;
    line-height: 46px;
    font-weight: 400;
  }
}
.rules {
  font-size: 14px;
  color: #444444;
  letter-spacing: 0;
  line-height: 21px;
  font-weight: 400;
  border-radius: 8px !important;
  .rulesContent {
    max-height: 75vh;
    overflow-y: scroll;
  }
  .state {
    background: #f5f5f5;
    padding: 10px 16px;
    margin-top: 10px;
  }
  .time {
    padding: 5px 16px;
    position: relative;
  }
  .work {
    padding: 5px 16px;
    position: relative;
  }
  .grad {
    padding: 5px 16px 16px;
    position: relative;
  }
  .htitle {
    font-size: 15px;
    color: #444444;
    letter-spacing: 0;
    line-height: 24px;
    font-weight: 600;
    padding-left: 7px;
  }
  .htitle::before {
    content: "";
    width: 2px;
    height: 16px;
    background-color: #ea5947;
    position: absolute;
    top: 9px;
    left: 16px;
  }
  .redFont {
    color: #ea5947;
  }
  .greyFont {
    color: #969696;
  }
  .close {
    position: absolute;
    top: 20px;
    right: 16px;
  }
  .tipsBox {
    position: absolute;
    bottom: 0px;
    height: 52px;
    width: 100%;
    // background-image: linear-gradient(
    //   180deg,
    //   rgba(238, 238, 238, 0) 0%,
    //   #ffffff 36%
    // );
    border-radius: 0 0 8px 8px;
    line-height: 52px;
    text-align: center;
    font-size: 15px;
    color: #8d77fb;
    letter-spacing: 0;
    text-align: center;
    font-weight: 400;
    background-color: #fff;
  }
}
.choseActonSheet {
  li {
    padding: 18px 0px;
    text-align: center;
  }
  li.active {
    background: #f5f5f5;
    color: #ea5947;
  }
}
.btnList {
  display: flex;
  margin: 0px 16px;
  padding: 20px 0px 40px;
  .publish {
    flex: 1;
    padding: 0px 20px;
    line-height: 44px;
    text-align: center;
    background-image: linear-gradient(225deg, #f97652 0%, #ea5947 100%);
    border-radius: 6px;
    box-shadow: none;
  }
  .cancle {
    flex: 1;
    line-height: 44px;
    margin-right: 16px;
    padding: 0px 20px;
    text-align: center;
    border: 1px solid #dedede;
  }
}
</style>
<style>
.van-popup--bottom.van-popup--round {
  border-radius: 0;
}
.Score .van-dialog__content {
  padding: 21px;
}
.assignHomework .van-dialog__header {
  font-size: 18px;
  color: #444444;
  letter-spacing: -0.17px;
  text-align: center;
  line-height: 27px;
  font-weight: 500;
}
</style>