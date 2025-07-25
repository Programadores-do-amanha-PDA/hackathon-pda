export interface ZoomAccountType {
  id: string;
  classroom_id: string;
  account_id: string;
  client_id: string;
  client_secret: string;
  me?: Partial<ZoomAccountMeType>;
  label?: string;
  created_at: string;
};

export interface ZoomAccountMeType {
  id: string;
  first_name: string;
  last_name: string;
  display_name: string;
  email: string;
  type: number;
  role_name: string;
  pmi: number;
  use_pmi: boolean;
  personal_meeting_url: string;
  timezone: string;
  verified: number;
  dept: string;
  created_at: string;
  last_login_time: string;
  last_client_version: string;
  pic_url: string;
  cms_user_id: string;
  jid: string;
  group_ids: string[];
  im_group_ids: string[];
  account_id: string;
  language: string;
  phone_country: string;
  phone_number: string;
  status: string;
  job_title: string;
  cost_center: string;
  company: string;
  location: string;
  custom_attributes: {
    key: string;
    name: string;
    value: string;
  }[];
  login_types: number[];
  role_id: string;
  account_number: number;
  cluster: string;
  phone_numbers: {
    country: string;
    code: string;
    number: string;
    verified: boolean;
    label: string;
  }[];
  user_created_at: string;
};
