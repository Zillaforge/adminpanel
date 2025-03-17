import {ref, watch, type Ref} from 'vue';
import router from '@/router';
import iconMember from '@/assets/images/icon_member.svg';
import iconProject from '@/assets/images/icon_project_mgt.svg';

import getTableHeaders from '@/utils/getTableHeaders';
import {type DataTableHeader} from '@/interfaces/VuetifyInterfaces';
import {
  type ProjectInfoInterface,
  type ProjectMembershipInterface,
  type ProjectCreateParams,
} from '@/interfaces/DataTypeInterface';
import {type NoDataSetting} from '@/interfaces/InfraDataTableInterface';
import PAGE_TYPES from '@/constants/PAGE_TYPES';
import {
  CLOUDINFRA_NAMESPACE,
  ISERVICE_NAMESPACE,
  PROJECT_TYPE,
  PROJECT_TYPE_ISERVICE,
  USER_EXTRA_INFO_KEY,
  ADMIN_TYPE,
  ADMIN_PROJECT_ID,
} from '@/constants/Constants';

import useBasics from '@/composables/useBasics';
import useUsers from '@/composables/useUsers';

import {
  addProjectMemberBatch,
  createProject,
  deleteProject,
  fetchProjectList,
  fetchProjectInfo,
  fetchProjectMemberList,
  fetchProjectMembership,
  removeProjectMember,
  updateProjectInfo,
  updateProjectMembership,
  updateProjectRole,
  updateProjectState,
} from '@/api';
import {makeApiCall, makeApiCallWithoutProgress} from '@/api/apiCallFunctions';
const {t, i18n, isSiteOrSystemAdmin} = useBasics();
const {getRoleDisplayName} = useUsers();
const currentPage = ref('');
const currentParams = ref({});

const headers: Ref<DataTableHeader[]> = ref([]);
const projectDetail = ref<ProjectInfoInterface | Record<string, any>>({});
const noDataSetting = ref<NoDataSetting>({
  image: iconProject,
  buttonTitle: t('basic.add.type', {type: t('basic.project')}),
  message1: t('basic.noData.type', {type: t('basic.project')}),
  message2: t('table.noData.project'),
});

const adminTypes = ref([
  {
    labelId: 'basic.site.admin',
    checked: true,
    permission: ADMIN_TYPE.SITE_ADMIN,
  },
  {
    labelId: 'basic.system.admin',
    checked: false,
    permission: ADMIN_TYPE.SYSTEM_ADMIN,
  },
]);

const externalStorageServicesHeaders: Ref<DataTableHeader[]> = ref([]);

const updateI18nStrings = (pageType: string) => {
  currentPage.value = pageType || currentPage.value;
  if (
    pageType === PAGE_TYPES.PROJECT_LIST ||
    pageType === PAGE_TYPES.PROJECT_ISERVICE_LIST ||
    pageType === PAGE_TYPES.PROJECT_DETAIL ||
    pageType === PAGE_TYPES.PROJECT_ISERVICE_DETAIL ||
    pageType === PAGE_TYPES.USER_ADMIN_LIST
  ) {
    headers.value = getTableHeaders(currentPage.value, currentParams.value);
  }

  if (pageType === PAGE_TYPES.PROJECT_LIST) {
    noDataSetting.value = {
      image: iconProject,
      buttonTitle: t('basic.add.type', {type: t('basic.project')}),
      message1: t('basic.noData.type', {type: t('basic.project')}),
      message2: t('table.noData.project'),
      action: () => toCreatePage(),
    };
  } else if (pageType === PAGE_TYPES.PROJECT_ISERVICE_LIST) {
    noDataSetting.value = {
      image: iconProject,
      buttonTitle: undefined,

      message1: t('basic.noData.less.type', {
        type: t('basic.project.type', {
          type: getProjectTypeName(PROJECT_TYPE.iSERVICE),
        }),
      }),
      message2: t('basic.noData.emptyMsg'),
      action: undefined,
    };
  } else if (
    pageType === PAGE_TYPES.PROJECT_DETAIL ||
    pageType === PAGE_TYPES.PROJECT_ISERVICE_DETAIL
  ) {
    noDataSetting.value = {
      image: iconMember,
      buttonTitle: t('basic.edit.type', {type: t('basic.member')}),
      message1: t('basic.noData.less.type', {type: t('basic.member')}),
      message2: t('basic.noData.emptyMsg'),
      action: () => toEditPage(projectDetail.value.projectId, true),
    };
  } else if (pageType === PAGE_TYPES.USER_ADMIN_LIST) {
    noDataSetting.value = {
      image: iconMember,
      buttonTitle: t('basic.add.type', {type: t('basic.admin')}),
      message1: t('basic.noData.less.type', {type: t('basic.admin')}),
      message2: t('basic.noData.emptyMsg'),
    };
  }

  externalStorageServicesHeaders.value = [
    {
      title: t('basic.type.type', {type: t('basic.service')}),
      key: 'asus-module',
      sortable: false,
    },
    {
      title: t('basic.name.type', {type: t('basic.service')}),
      key: 'asus-displayName',
      sortable: false,
    },
    {
      title: t('basic.creator'),
      key: 'creator',
      sortable: false,
    },
  ];
};

watch(
  () => i18n.global.locale,
  () => {
    updateI18nStrings(currentPage.value);
  },
);

const projectList: any = ref([]);
const projectMap = ref<Record<string, any>>([]);
const projectFullList: any = ref([]);
const getProjects = async () => {
  await makeApiCallWithoutProgress({
    apiCallFn: fetchProjectList,
    actionName: 'fetchProjectList',
    actionType: t('basic.get.data'),
  }).then((res: any) => {
    if (!Array.isArray(res)) {
      projectList.value = [];
      return;
    }
    projectFullList.value = res.map((project: any) => {
      // if (project.displayName === 'administrator') {
      //   globalStore.setAdminPrjId(project.projectId);
      // }
      return {
        ...project,
        codeName: project.extra?.iservice?.projectSysCode ?? '',
      };
    });
    projectList.value = projectFullList.value.filter(
      (project: any) => project.projectId !== ADMIN_PROJECT_ID,
    );

    projectMap.value = (projectList.value || []).reduce(
      (map: Array<Record<string, any>>, project: Record<string, any>) => {
        map[project.projectId] = {
          displayName: project.displayName,
          codeName: project.codeName,
          type:
            project.namespace === CLOUDINFRA_NAMESPACE
              ? t('basic.project.type', {type: t('basic.testing')})
              : PROJECT_TYPE_ISERVICE,
        };
        return map;
      },
      {},
    );
  });
};

const getProjectDetail = async (projectId: string) => {
  projectDetail.value = await makeApiCallWithoutProgress({
    apiCallFn: fetchProjectInfo,
    payload: {
      projectId,
    },
    actionName: 'fetchProjectInfo',
    actionType: t('basic.get.data'),
  });
};

const projectMemberList = ref<ProjectMembershipInterface[]>([]);

const getProjectMemberList = async (projectId: string) => {
  await makeApiCallWithoutProgress({
    apiCallFn: fetchProjectMemberList,
    payload: {
      projectId,
    },
    actionName: 'fetchProjectMemberList',
    actionType: t('basic.get.data'),
  }).then((res: any) => {
    // avoid vue warning for unexpected data type
    projectMemberList.value = res.map((member: any) => {
      return {
        ...member,
        user: {
          ...(member?.user ?? {}),
          extra: {
            ...(member?.user?.extra ?? {}),
            [USER_EXTRA_INFO_KEY]: {
              ...(member.user.extra?.[USER_EXTRA_INFO_KEY] ?? {}),
              department:
                member.user.extra?.[USER_EXTRA_INFO_KEY]?.department ?? '',
              title: member.user.extra?.[USER_EXTRA_INFO_KEY]?.title ?? '',
              telephone:
                member.user.extra?.[USER_EXTRA_INFO_KEY]?.telephone ?? '',
            },
          },
        },
        account: member.user ? member.user.account : '',
        id: member.user ? member.user.userId : '',
        userPermission: getRoleDisplayName(member?.tenantRole),
        'site-admin': isSiteOrSystemAdmin(
          member.extra.opUserMode,
          ADMIN_TYPE.SITE_ADMIN,
        )
          ? 'enabled'
          : '',
        'sys-admin': isSiteOrSystemAdmin(
          member.extra.opUserMode,
          ADMIN_TYPE.SYSTEM_ADMIN,
        )
          ? 'enabled'
          : '',
      };
    });

    // projectDetail.value.members = projectMemberList.value
    //   .map((membership) => membership.user.account)
    //   .sort()
  });
};

const execSwitchProjectStatus = (projectId: string, newStatus: boolean) => {
  return makeApiCallWithoutProgress({
    apiCallFn: updateProjectState,
    payload: {
      projectId,
      frozen: newStatus,
    },
    actionName: 'updateProjectState',
    actionType: t('basic.edit.type'),
  });
};

const execCreateProject = (params: ProjectCreateParams) => {
  return makeApiCall({
    apiCallFn: createProject,
    payload: params,
    actionName: 'createProject',
    actionType: t('basic.create'),
  });
};

const execUpdateProjectInfo = async (
  projectId: string,
  params: Record<string, any>,
) => {
  await makeApiCallWithoutProgress({
    apiCallFn: updateProjectInfo,
    payload: {
      projectId,
      data: params,
    },
    actionName: 'updateProjectInfo',
    actionType: t('basic.update'),
  });
};

const execAddProjectMembers = async (data: any) => {
  await makeApiCallWithoutProgress({
    apiCallFn: addProjectMemberBatch,
    payload: {...data},
    actionName: 'addProjectMemberBatch',
    actionType: t('basic.update'),
  });
};

const execFetchProjectMembership = (projectId: string, userId: string) => {
  return makeApiCall({
    apiCallFn: fetchProjectMembership,
    payload: {
      projectId,
      userId,
    },
    actionName: 'fetchProjectMembership',
    actionType: t('basic.get.data'),
  });
};

const execUpdateProjectMembership = async (
  projectId: string,
  userId: string,
  userPermissionId: string,
) => {
  await makeApiCallWithoutProgress({
    apiCallFn: updateProjectMembership,
    payload: {
      projectId,
      userId,
      data: {
        userPermissionId,
      },
    },
    actionName: 'updateProjectMembership',
    actionType: t('basic.update'),
  });
};

const execUpdateProjectRole = async (
  projectId: string,
  userId: string,
  tenantRole: string,
) => {
  await makeApiCallWithoutProgress({
    apiCallFn: updateProjectRole,
    payload: {
      projectId,
      userId,
      data: {
        tenantRole,
      },
    },
    actionName: 'updateProjectRole',
    actionType: t('basic.update'),
  });
};

const execUpdateAdminRole = async (
  projectId: string,
  userId: string,
  adminRole: number,
) => {
  await makeApiCallWithoutProgress({
    apiCallFn: updateProjectMembership,
    payload: {
      projectId,
      userId,
      data: {
        extra: {
          opUserMode: adminRole,
        },
      },
    },
    actionName: 'updateProjectMembership',
    actionType: t('basic.update'),
  });
};

const execRemoveProjectMember = async (projectId: string, userId: string) => {
  await makeApiCallWithoutProgress({
    apiCallFn: removeProjectMember,
    payload: {
      projectId,
      userId,
    },
    actionName: 'removeProjectMember',
    actionType: t('basic.update'),
  });
};

const execDeleteProject = async (projectId: string) => {
  await makeApiCallWithoutProgress({
    apiCallFn: deleteProject,
    payload: {projectId},
    actionName: 'deleteProject',
    actionType: t('basic.delete'),
  });
};

const execBatchDeleteProjects = (projects: string) => {
  console.warn('batch delete project, NOT support yet!', projects);
  // return store.dispatch('deleteBatchProject', {
  //   items: projects,
  //   token: getToken(),
  // });
};

const toListPage = () => {
  void router.push({name: PAGE_TYPES.PROJECT_LIST});
};
const toCreatePage = () => {
  void router.push({name: PAGE_TYPES.PROJECT_CREATE});
};
const toDetailPage = (id: string, projectType: string = '') => {
  void router.push({
    name:
      projectType === PROJECT_TYPE.GENERAL
        ? PAGE_TYPES.PROJECT_DETAIL
        : PAGE_TYPES.PROJECT_ISERVICE_DETAIL,
    params: {
      id,
    },
  });
};

const toEditPage = (id: string, isDetailPage: boolean = false) => {
  void router.push({
    name: isDetailPage
      ? PAGE_TYPES.PROJECT_MEMBER_EDIT
      : PAGE_TYPES.PROJECT_EDIT,
    params: {id},
  });
};

const processProjectMembershipUpdated = async (
  projectId: string,
  newList: string[] = [],
  removeList: string[] = [],
  membershipMeta: Record<string, any>,
) => {
  const promiseArray = [];
  if (removeList.length > 0) {
    removeList.forEach((member: string) => {
      promiseArray.push(execRemoveProjectMember(projectId, member));
    });
  }

  if (newList.length > 0) {
    const memberList = newList.map((member: string) => ({
      userId: member,
      projectId,
    }));

    const addParams = {
      memberList,
      membershipMeta,
    };
    promiseArray.push(execAddProjectMembers(addParams));
  }
  await Promise.all(promiseArray).finally(() => {});
};

export const getProjectType = (namespace: string) => {
  return namespace === CLOUDINFRA_NAMESPACE
    ? PROJECT_TYPE.GENERAL
    : namespace === ISERVICE_NAMESPACE
    ? PROJECT_TYPE.iSERVICE
    : '';
};

export const getProjectTypeName = (projectType: string) => {
  return projectType === PROJECT_TYPE.GENERAL
    ? t('basic.testing')
    : projectType === PROJECT_TYPE.iSERVICE
    ? 'iService'
    : '';
};

export default function (pageType: string = '') {
  if (pageType) {
    updateI18nStrings(pageType);
  }
  return {
    adminTypes,
    headers,
    noDataSetting,
    externalStorageServicesHeaders,
    getProjectType,
    getProjectTypeName,

    projectList,
    projectMap,
    projectFullList,
    getProjects,
    projectDetail,
    getProjectDetail,
    projectMemberList,
    getProjectMemberList,

    execSwitchProjectStatus,
    execCreateProject,
    execAddProjectMembers,
    execFetchProjectMembership,
    execUpdateAdminRole,
    execUpdateProjectMembership,
    execUpdateProjectRole,
    execRemoveProjectMember,
    execDeleteProject,
    execBatchDeleteProjects,

    execUpdateProjectInfo,

    processProjectMembershipUpdated,

    toListPage,
    toCreatePage,
    toDetailPage,
    toEditPage,
  };
}
