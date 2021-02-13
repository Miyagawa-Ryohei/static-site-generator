
export enum IPC_RENDERER_EVENTS {

    LOAD_APPLICATION_CONFIG = "load_application_config",
    LOAD_APPLICATION_CONFIG_REPLY = "load_application_config_reply",

    APPLY_PREVIEW = "apply_preview",
    APPLY_PREVIEW_REPLY = "apply_preview_reply",

    LOAD_HTML_CONFIG = "load_html_config",
    LOAD_HTML_CONFIG_REPLY = "load_html_config_reply",

    LOAD_ALL_CONFIG = "load_all_config",
    LOAD_ALL_CONFIG_REPLY = "load_all_config_reply",

    READ_FILE = "read_file",
    READ_FILE_REPLY = "read_file_reply",

    WRITE_FILE = "write_file",
    WRITE_FILE_REPLY = "write_file_reply",

    COPY_FILE = "copy_file",
    COPY_FILE_REPLY = "copy_file_reply",

    EXPORT_PROJECT = "export_project",
    EXPORT_PROJECT_REPLY = "export_project_reply",

    CREATE_NEW_PAGE = "create_new_page",
    CREATE_NEW_PAGE_REPLY = "create_new_page_reply"
}