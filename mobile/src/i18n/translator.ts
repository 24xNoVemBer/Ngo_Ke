import type { Locale } from '../data/locale';

export type TranslationKey =
  // Voice error codes (matching useVoiceSession.ts lines 42-57)
  | 'voice.error.MIC_PERMISSION_DENIED'
  | 'voice.error.MIC_PERMISSION_BLOCKED'
  | 'voice.error.AUDIO_TOO_SHORT'
  | 'voice.error.RECORDER_START_FAILED'
  | 'voice.error.AUDIO_PLAYER_STOP_TIMEOUT'
  | 'voice.error.AUDIO_TOO_LONG'
  | 'voice.error.NO_SPEECH'
  | 'voice.error.VOICE_NOT_CONFIGURED'
  | 'voice.error.ASR_TIMEOUT'
  | 'voice.error.ASR_UNAVAILABLE'
  | 'voice.error.ASR_BUSY'
  | 'voice.error.RATE_LIMITED'
  | 'voice.error.INVALID_AUDIO'
  | 'voice.error.UNSUPPORTED_LOCALE'
  | 'voice.error.DEFAULT'
  // Voice notices
  | 'voice.notice.last_chapter'
  | 'voice.notice.playback_stopped'
  | 'voice.notice.stop_pending'
  | 'voice.notice.live_no_audio'
  | 'voice.notice.live_answer_no_audio'
  | 'voice.notice.answer_matched_read_text'
  | 'voice.notice.reference_missing'
  | 'voice.notice.reference_changed'
  | 'voice.notice.audio_unavailable'
  | 'voice.notice.quota_exceeded'
  // Voice intent messages (for clarify / ambiguous handling)
  | 'voice.intent.clarify_action'
  | 'voice.intent.clarify_plan'
  | 'voice.intent.clarify_plan_question'
  | 'voice.intent.ambiguous_topic_multiple'
  | 'voice.intent.ambiguous_topic_negation'
  | 'voice.intent.ambiguous_duration_unrecognized'
  | 'voice.intent.ambiguous_duration_multiple'
  | 'voice.intent.ambiguous_duration_range'
  // Voice stages / a11y announcements
  | 'voice.stage.preparing'
  | 'voice.stage.recording'
  | 'voice.stage.ready'
  | 'voice.stage.stopping'
  | 'voice.stage.transcribing'
  // Voice interaction dock
  | 'voice.dock.toolbar'
  | 'voice.dock.start_recording'
  | 'voice.dock.retry_recording'
  | 'voice.dock.recording'
  | 'voice.dock.meter_label'
  | 'voice.dock.ready'
  | 'voice.dock.ready_subtitle'
  | 'voice.dock.preparing'
  | 'voice.dock.stopping'
  | 'voice.dock.transcribing'
  | 'voice.dock.error_title'
  | 'voice.dock.idle_title'
  | 'voice.dock.busy_subtitle'
  | 'voice.dock.idle_subtitle'
  | 'voice.dock.submit'
  | 'voice.dock.cancel'
  | 'voice.dock.btn_submit'
  | 'voice.dock.btn_cancel'
  | 'voice.dock.open_settings'
  | 'voice.dock.type_question'
  // Player
  | 'player.play'
  | 'player.pause'
  | 'player.ready'
  | 'player.replay'
  | 'player.stop'
  | 'player.progress'
  // Drawer
  | 'drawer.title'
  | 'drawer.placeholder'
  | 'drawer.close_backdrop'
  | 'drawer.collapse'
  | 'drawer.send'
  | 'drawer.btn_send'
  | 'drawer.suggestions_title'
  | 'drawer.select_suggestion'
  // Live status reasons
  | 'live.reason.no_config.title'
  | 'live.reason.no_config.detail'
  | 'live.reason.no_data.title'
  | 'live.reason.no_data.detail'
  | 'live.reason.shape.title'
  | 'live.reason.shape.detail'
  | 'live.reason.http.title'
  | 'live.reason.http.detail'
  | 'live.reason.network.title'
  | 'live.reason.network.detail'
  | 'live.reason.timeout.title'
  | 'live.reason.timeout.detail'
  // Common UI
  | 'common.close'
  | 'common.back'
  | 'common.cancel'
  | 'common.send'
  | 'common.retry'
  | 'common.loading'
  | 'common.demo'
  | 'common.live'
  | 'common.simulated'
  | 'common.reviewed'
  | 'common.error'
  | 'common.empty'
  | 'common.stop_count'
  | 'common.chapter_count'
  | 'common.change_language'
  | 'common.switch_to_demo'
  | 'common.minutes'
  | 'common.photo_disclaimer'
  | 'common.photo_author'
  | 'common.visited_stamp'
  | 'common.simulated_minutes'
  | 'common.explore_this_point'
  | 'common.narrator_label'
  // Prologue
  | 'prologue.eyebrow'
  | 'prologue.title'
  | 'prologue.subtitle'
  | 'prologue.quote'
  | 'prologue.start_button'
  | 'prologue.start_label'
  | 'prologue.hint'
  | 'prologue.lang_vi'
  | 'prologue.lang_en'
  // Collections
  | 'collection.fiction_letter.name'
  | 'collection.fiction_letter.tagline'
  | 'collection.fiction_letter.theme'
  | 'collection.fiction_letter.district'
  | 'collection.old_quarter_pilot.name'
  | 'collection.old_quarter_pilot.tagline'
  | 'collection.old_quarter_pilot.theme'
  | 'collection.old_quarter_pilot.district'
  // Landing
  | 'landing.soundscape_banner'
  | 'landing.featured_section_pre'
  | 'landing.featured_section_title'
  | 'landing.see_all'
  | 'landing.see_all_label'
  | 'landing.passport_title'
  | 'landing.passport_desc'
  | 'landing.passport_open_label'
  | 'landing.passport_guide'
  | 'landing.passport_phase'
  | 'landing.badge_sample'
  // Alley select
  | 'alley_select.title'
  | 'alley_select.subtitle'
  | 'alley_select.open_label'
  | 'alley_select.meta_info'
  | 'alley_select.demo_area'
  | 'alley_select.demo_subtext'
  | 'alley_select.search_placeholder'
  | 'alley_select.clear_search'
  | 'alley_select.hint'
  | 'alley_select.explore_count'
  | 'alley_select.sample_list'
  | 'alley_select.empty'
  | 'alley_select.reset_filter'
  // Home
  | 'home.open_story'
  | 'home.stories_opened'
  | 'home.explore_current'
  | 'home.unopened'
  | 'home.opened'
  | 'home.menu_title'
  | 'home.language_selector'
  // QA
  | 'qa.read_text'
  | 'qa.collapse_text'
  | 'qa.prev_stop'
  | 'qa.prev_stop_label'
  | 'qa.next_stop'
  | 'qa.next_stop_label'
  | 'qa.ask_header'
  | 'qa.answer_evidence'
  | 'qa.follow_ups_header'
  | 'qa.source_disclaimer'
  | 'qa.photo_note'
  | 'qa.photographer'
  | 'qa.type_question_placeholder'
  | 'qa.open_camera'
  | 'qa.open_location'
  | 'qa.open_plan'
  | 'qa.missing_audio'
  | 'qa.no_match'
  // Plan
  | 'plan.title'
  | 'plan.subtitle'
  | 'plan.topic_header'
  | 'plan.time_header'
  | 'plan.topic_food'
  | 'plan.topic_history'
  | 'plan.topic_explore'
  | 'plan.custom_topic'
  | 'plan.custom_time'
  | 'plan.recommendations_header'
  | 'plan.recommendations_empty'
  | 'plan.go_to_stop'
  | 'plan.estimated_time'
  | 'plan.toggle_manual'
  | 'plan.custom_topic_placeholder'
  | 'plan.apply_button'
  | 'plan.topic_hint'
  | 'plan.custom_time_placeholder'
  | 'plan.time_hint'
  // Camera
  | 'camera.title'
  | 'camera.phase'
  | 'camera.main_title'
  | 'camera.subtitle'
  | 'camera.camera_on'
  | 'camera.camera_off'
  | 'camera.camera_on_hint'
  | 'camera.camera_off_hint'
  | 'camera.enable_button'
  | 'camera.turn_off_button'
  | 'camera.viewfinder_instruction'
  | 'camera.scan_again'
  | 'camera.confirm_point'
  | 'camera.identified_qr'
  | 'camera.pending_body'
  | 'camera.manual_selection'
  | 'camera.manual_hint'
  | 'camera.choose_manual'
  | 'camera.scanning'
  | 'camera.permission_denied'
  | 'camera.permission_blocked'
  | 'camera.unrecognized_qr'
  | 'camera.choose_another_stop'
  // Location
  | 'location.title'
  | 'location.find_button'
  | 'location.waiting'
  | 'location.stop_waiting'
  | 'location.confirm_button'
  | 'location.manual_list'
  | 'location.nearest_candidate'
  | 'location.distance_hint'
  | 'location.err_poor_accuracy'
  | 'location.err_outside'
  | 'location.err_no_coords'
  | 'location.err_needs_position'
  // Unavailable
  | 'unavailable.phase'
  | 'unavailable.title'
  | 'unavailable.note';

export const DICTIONARY: Record<Locale, Record<TranslationKey, string>> = {
  vi: {
    'voice.error.MIC_PERMISSION_DENIED': 'Ngõ Kể chưa được cấp quyền dùng micro. Bạn có thể gõ câu hỏi thay thế.',
    'voice.error.MIC_PERMISSION_BLOCKED': 'Quyền micro đã bị chặn trong Cài đặt. Bật quyền micro hoặc gõ câu hỏi thay thế.',
    'voice.error.AUDIO_TOO_SHORT': 'Câu nói hơi ngắn. Hãy nói rõ câu hỏi rồi chạm Gửi.',
    'voice.error.RECORDER_START_FAILED': 'Micro chưa bắt đầu thu được. Hãy chạm để thử lại.',
    'voice.error.AUDIO_PLAYER_STOP_TIMEOUT': 'Lời kể chưa dừng hẳn. Hãy thử lại sau một chút.',
    'voice.error.AUDIO_TOO_LONG': 'Câu nói dài quá. Hãy chia thành một câu hỏi ngắn hơn.',
    'voice.error.NO_SPEECH': 'Mình chưa nghe thấy lời nói rõ. Hãy thử lại gần micro hơn.',
    'voice.error.VOICE_NOT_CONFIGURED': 'Bản thử chưa cấu hình máy nhận giọng nói. Hãy mở lại Expo Go theo hướng dẫn, hoặc gõ câu hỏi thay thế.',
    'voice.error.ASR_TIMEOUT': 'Nhận dạng mất quá lâu. Hãy thử lại khi kết nối ổn định.',
    'voice.error.ASR_UNAVAILABLE': 'Máy nhận dạng giọng nói chưa chạy. Hãy thử lại sau.',
    'voice.error.ASR_BUSY': 'Máy nhận dạng đang bận. Chờ một chút rồi thử lại nhé.',
    'voice.error.RATE_LIMITED': 'Bạn vừa gửi nhiều lượt liên tiếp. Chờ một chút rồi thử lại nhé.',
    'voice.error.INVALID_AUDIO': 'Bản ghi không đọc được. Hãy thu lại câu hỏi.',
    'voice.error.UNSUPPORTED_LOCALE': 'Ngôn ngữ chưa được hỗ trợ nhận dạng giọng nói.',
    'voice.error.DEFAULT': 'Chưa gửi được câu hỏi. Kiểm tra kết nối tới máy nhận giọng nói rồi thử lại.',

    'voice.notice.last_chapter': 'Đây là chương cuối đang mở.',
    'voice.notice.playback_stopped': 'Đã dừng lời kể.',
    'voice.notice.stop_pending': 'Lời kể chưa dừng hẳn. Hãy thử lại sau một chút.',
    'voice.notice.live_no_audio': 'Lời kể Live chưa có bản đọc. Bạn có thể mở chữ hoặc chọn một câu hỏi gợi ý.',
    'voice.notice.live_answer_no_audio': 'Chế độ Live chưa có bản đọc. Chạm “Xem lời kể bằng chữ” để đọc câu trả lời.',
    'voice.notice.answer_matched_read_text': 'Câu trả lời đã khớp. Bản đọc chưa có trong chế độ Live; chạm “Xem lời kể bằng chữ” để mở nội dung.',
    'voice.notice.reference_missing': 'Mình chưa có danh sách câu hỏi của lượt trước để biết “câu đầu tiên” là câu nào. Chọn một câu bên dưới nhé.',
    'voice.notice.reference_changed': 'Danh sách câu hỏi vừa thay đổi. Chọn lại một câu bên dưới nhé.',
    'voice.notice.audio_unavailable': 'Không mở được bản đọc. Bạn vẫn có thể xem lời kể bằng chữ.',
    'voice.notice.quota_exceeded': 'Đã đạt giới hạn {seconds} giây. Nhấn Gửi để tiếp tục hoặc Huỷ để ghi âm lại.',

    'voice.intent.clarify_action': 'Bạn muốn nghe câu trả lời hay thực hiện thao tác vừa nói?',
    'voice.intent.clarify_plan': 'Bạn muốn hỏi về trải nghiệm hay mở phần chọn hành trình?',
    'voice.intent.clarify_plan_question': 'Bạn muốn hỏi về trải nghiệm hay mở phần chọn hành trình?',
    'voice.intent.ambiguous_topic_multiple': 'Mình nghe thấy hơn một chủ đề. Hãy chọn một chủ đề bên dưới.',
    'voice.intent.ambiguous_topic_negation': 'Mình không muốn tự chọn chủ đề khi câu có lời phủ định. Hãy chạm một chủ đề bên dưới.',
    'voice.intent.ambiguous_duration_unrecognized': 'Mình chưa hiểu thời lượng. Hãy chọn số phút bên dưới.',
    'voice.intent.ambiguous_duration_multiple': 'Mình nghe thấy hơn một khoảng thời gian. Hãy chọn một mức bên dưới.',
    'voice.intent.ambiguous_duration_range': 'Thời lượng cần từ 1 đến 180 phút. Hãy chọn lại bên dưới.',

    'voice.stage.preparing': 'Đang bật micro.',
    'voice.stage.recording': 'Đang thu câu hỏi. Chạm Gửi để kết thúc hoặc Hủy bản ghi.',
    'voice.stage.ready': 'Đã thu xong. Chạm Gửi để hỏi tiếp hoặc Hủy bản ghi.',
    'voice.stage.stopping': 'Đang lưu câu nói.',
    'voice.stage.transcribing': 'Đang xử lý câu hỏi.',

    'voice.dock.toolbar': 'Hỏi người kể',
    'voice.dock.start_recording': 'Bắt đầu hỏi bằng giọng nói',
    'voice.dock.retry_recording': 'Thu lại câu hỏi bằng giọng nói',
    'voice.dock.recording': 'Đang thu · {duration}',
    'voice.dock.meter_label': 'Mức âm thanh đang thu',
    'voice.dock.ready': 'Đã thu xong · {duration}',
    'voice.dock.ready_subtitle': 'Chạm Gửi để hỏi tiếp',
    'voice.dock.preparing': 'Đang bật micro…',
    'voice.dock.stopping': 'Đang lưu câu nói…',
    'voice.dock.transcribing': 'Đang nghe câu hỏi…',
    'voice.dock.error_title': 'Thử lại bằng giọng nói',
    'voice.dock.idle_title': 'Nhấn để hỏi',
    'voice.dock.busy_subtitle': 'Bạn có thể hủy bất cứ lúc nào',
    'voice.dock.idle_subtitle': 'Nói “Phát lời kể” rồi hỏi tiếp',
    'voice.dock.submit': 'Gửi câu hỏi',
    'voice.dock.cancel': 'Hủy lượt hỏi',
    'voice.dock.btn_submit': 'Gửi',
    'voice.dock.btn_cancel': 'Hủy',
    'voice.dock.open_settings': 'Mở Cài đặt',
    'voice.dock.type_question': 'Mở ô gõ câu hỏi',

    'player.play': 'Phát {label}',
    'player.pause': 'Tạm dừng lời kể',
    'player.ready': 'Sẵn sàng',
    'player.replay': 'Nghe lại {label}',
    'player.stop': 'Dừng {label}',
    'player.progress': 'Tiến trình phát {percent} phần trăm',

    'drawer.title': 'Đặt câu hỏi cho người kể',
    'drawer.placeholder': 'Gõ câu hỏi về con ngõ này…',
    'drawer.close_backdrop': 'Đóng khung gõ câu hỏi',
    'drawer.collapse': 'Thu gọn khung nhập',
    'drawer.send': 'Gửi câu hỏi',
    'drawer.btn_send': 'Gửi',
    'drawer.suggestions_title': 'Câu hỏi gợi ý chạm nhanh:',
    'drawer.select_suggestion': 'Chọn câu hỏi: {question}',

    'live.reason.no_config.title': 'Live chưa được cấu hình',
    'live.reason.no_config.detail': 'Chưa có URL backend cho chế độ live. App không tự chuyển sang dữ liệu demo và không tự tạo nội dung. Cấu hình EXPO_PUBLIC_NGOKE_API_BASE_URL hoặc app.json extra.apiBaseUrl rồi bấm “Thử lại”.',
    'live.reason.no_data.title': 'Live chưa có dữ liệu',
    'live.reason.no_data.detail': 'Máy chủ trả về nhưng chưa có điểm nào đã duyệt. App giữ nguyên chế độ live và không nạp dữ liệu demo.',
    'live.reason.shape.title': 'Dữ liệu live không đúng định dạng',
    'live.reason.shape.detail': 'Bản trả về không khớp schema phiên bản 1, hoặc thiếu nguồn của câu trả lời. App từ chối hiển thị thay vì hiện nội dung thiếu căn cứ.',
    'live.reason.http.title': 'Máy chủ live trả lỗi',
    'live.reason.http.detail': 'Máy chủ không trả về dữ liệu hợp lệ. Bấm “Thử lại” sau khi máy chủ sẵn sàng.',
    'live.reason.network.title': 'Không kết nối được máy chủ live',
    'live.reason.network.detail': 'Kiểm tra mạng hoặc URL backend rồi bấm “Thử lại”.',
    'live.reason.timeout.title': 'Máy chủ live phản hồi quá chậm',
    'live.reason.timeout.detail': 'Quá 8 giây không có phản hồi nên app dừng chờ. Bấm “Thử lại”.',

    'common.close': 'Đóng',
    'common.back': 'Quay lại',
    'common.cancel': 'Hủy',
    'common.send': 'Gửi',
    'common.retry': 'Thử lại',
    'common.loading': 'Đang tải…',
    'common.demo': 'Demo',
    'common.live': 'Live',
    'common.simulated': 'Mô phỏng',
    'common.reviewed': 'Đã duyệt',
    'common.error': 'Lỗi',
    'common.empty': 'Chưa có dữ liệu',
    'common.stop_count': '{count} điểm',
    'common.chapter_count': '{count} chương',
    'common.change_language': 'Đổi ngôn ngữ',
    'common.switch_to_demo': 'Chuyển sang Demo',
    'common.minutes': '{minutes} phút',
    'common.photo_disclaimer': 'Ảnh minh họa · điểm mô phỏng',
    'common.photo_author': 'Tác giả: {author}',
    'common.visited_stamp': 'ĐÃ GHÉ THĂM',
    'common.simulated_minutes': '{minutes} phút mô phỏng',
    'common.explore_this_point': 'Khám phá điểm này',
    'common.narrator_label': 'Người kể 2D tạm',

    'prologue.eyebrow': 'MỘT TRANG KÝ ỨC HÀ NỘI',
    'prologue.title': 'NGÕ KỂ',
    'prologue.subtitle': 'KÝ ỨC NGÕ PHỐ HÀ NỘI',
    'prologue.quote': '“Trong bóng sớm mai, ngõ nhỏ bâng khuâng thức giấc,\nkể lại lời thì thầm giữa lòng phố cổ.”',
    'prologue.start_button': 'BẮT ĐẦU DẠO NGÕ',
    'prologue.start_label': 'Bắt đầu dạo ngõ Hà Nội',
    'prologue.hint': 'Chạm để mở lối ký ức phố ngõ',
    'prologue.lang_vi': 'Tiếng Việt',
    'prologue.lang_en': 'English',

    'collection.fiction_letter.name': 'Phố Hàng Bút',
    'collection.fiction_letter.tagline': 'Chuyện phiêu lưu giả tưởng 6 chương',
    'collection.fiction_letter.theme': 'Chuyện xưa',
    'collection.fiction_letter.district': 'Hoàn Kiếm, Hà Nội',
    'collection.old_quarter_pilot.name': 'Thử nghiệm Phố Cổ',
    'collection.old_quarter_pilot.tagline': '3 điểm dừng lịch sử có tư liệu',
    'collection.old_quarter_pilot.theme': 'Di sản',
    'collection.old_quarter_pilot.district': 'Phố Cổ, Hoàn Kiếm',

    'landing.soundscape_banner': 'Lời kể bằng chữ · nội dung mô phỏng · {mode}',
    'landing.featured_section_pre': 'HÀNH TRÌNH NỔI BẬT',
    'landing.featured_section_title': 'Chọn một con ngõ',
    'landing.see_all': 'Xem tất cả ›',
    'landing.see_all_label': 'Xem tất cả con ngõ',
    'landing.passport_title': 'Hộ chiếu ngõ phố',
    'landing.passport_desc': 'Xem mẫu sổ tay · chưa lưu lịch sử ghé thăm',
    'landing.passport_open_label': 'Mở Hộ chiếu ngõ phố',
    'landing.passport_guide': 'Đây là mẫu trình bày sổ tay. Demo chưa lưu lịch sử ghé thăm; các trang bên dưới chưa có dấu xác nhận.',
    'landing.passport_phase': 'BỘ SƯU TẬP DI SẢN',
    'landing.badge_sample': 'MẪU',

    'alley_select.title': 'Bộ sưu tập con ngõ',
    'alley_select.subtitle': 'Chọn một hành trình để bắt đầu khám phá',
    'alley_select.open_label': 'Mở {name}',
    'alley_select.meta_info': 'Bìa minh họa · {count} điểm · {mode}',
    'alley_select.demo_area': 'KHU VỰC DEMO',
    'alley_select.demo_subtext': 'Phố cổ Hà Nội · nội dung mô phỏng',
    'alley_select.search_placeholder': 'Tìm phố hoặc ngõ',
    'alley_select.clear_search': 'Xóa từ khóa tìm kiếm',
    'alley_select.hint': 'Chọn bìa ngõ bên dưới để mở bộ điểm từ nguồn {mode}',
    'alley_select.explore_count': 'Các con ngõ khám phá ({count})',
    'alley_select.sample_list': 'Danh sách mẫu · không đo khoảng cách từ bạn',
    'alley_select.empty': 'Không tìm thấy địa chỉ hoặc con ngõ phù hợp',
    'alley_select.reset_filter': 'Xem tất cả các con ngõ ›',

    'home.open_story': 'Xem {name}',
    'home.stories_opened': 'Đã mở {opened}/{total} câu chuyện · {mode}',
    'home.explore_current': 'Khám phá điểm này',
    'home.unopened': 'Chưa mở',
    'home.opened': 'Đã mở',
    'home.menu_title': 'Tùy chọn',
    'home.language_selector': 'Ngôn ngữ',

    'qa.read_text': 'Xem lời kể bằng chữ',
    'qa.collapse_text': 'Thu gọn lời kể',
    'qa.prev_stop': '‹ Điểm trước',
    'qa.prev_stop_label': 'Điểm trước đó',
    'qa.next_stop': 'Điểm tiếp theo ›',
    'qa.next_stop_label': 'Điểm tiếp theo',
    'qa.ask_header': 'Hỏi thêm người kể',
    'qa.answer_evidence': 'Căn cứ',
    'qa.follow_ups_header': 'Câu hỏi gợi ý tiếp theo',
    'qa.source_disclaimer': 'Nguồn',
    'qa.photo_note': 'Ảnh minh họa',
    'qa.photographer': 'Nhiếp ảnh',
    'qa.type_question_placeholder': 'Nhập câu hỏi của bạn…',
    'qa.open_camera': 'Mở camera',
    'qa.open_location': 'Mở vị trí',
    'qa.open_plan': 'Chọn trải nghiệm',
    'qa.missing_audio': 'Bản đọc chưa sẵn sàng cho nội dung này. Bạn vẫn có thể xem lời kể bằng chữ.',
    'qa.no_match': 'Chưa có dữ liệu cho câu hỏi này. Hãy thử chọn một câu gợi ý bên dưới.',

    'plan.title': 'Chọn trải nghiệm',
    'plan.subtitle': 'Chọn chủ đề và quỹ thời gian để gợi ý lộ trình',
    'plan.topic_header': 'Chủ đề',
    'plan.time_header': 'Quỹ thời gian',
    'plan.topic_food': 'Ẩm thực ngõ',
    'plan.topic_history': 'Chuyện xưa hoài niệm',
    'plan.topic_explore': 'Khám phá tự do',
    'plan.custom_topic': 'Chủ đề khác',
    'plan.custom_time': 'Thời gian khác',
    'plan.recommendations_header': 'Gợi ý điểm dừng',
    'plan.recommendations_empty': 'Không tìm thấy điểm dừng phù hợp với lựa chọn này.',
    'plan.go_to_stop': 'Đến điểm này',
    'plan.estimated_time': '~{minutes} phút',
    'plan.toggle_manual': '⌨ Nhập chủ đề hoặc thời gian khác...',
    'plan.custom_topic_placeholder': 'Tự gõ: ăn thực, chuyện xưa...',
    'plan.apply_button': 'Dùng',
    'plan.topic_hint': 'Chưa nhận ra chủ đề này. Hãy thử “ẩm thực”, “chuyện xưa” hoặc “khám phá tự do”.',
    'plan.custom_time_placeholder': 'Ví dụ: khoảng 30 phút, 1 tiếng...',
    'plan.time_hint': 'Chưa nhận ra khoảng thời gian này. Hãy thử 30 phút hoặc 1 tiếng.',

    'camera.title': 'Camera và người kể',
    'camera.phase': 'Góc kính thực tế · Quét QR & Lời kể',
    'camera.main_title': 'Điểm chạm không gian',
    'camera.subtitle': 'Quét mã QR gắn tại con ngõ hoặc chọn điểm trên sổ tay để đọc lời kể tại chỗ.',
    'camera.camera_on': 'Ống kính đang mở',
    'camera.camera_off': 'Camera chưa bật',
    'camera.camera_on_hint': 'Hướng camera vào mã QR của điểm ngõ để kích hoạt lời người kể.',
    'camera.camera_off_hint': 'Ứng dụng tôn trọng quyền riêng tư: chỉ bật camera khi bạn chạm nút dưới đây.',
    'camera.enable_button': 'Bật camera và quét QR',
    'camera.turn_off_button': 'Tắt camera',
    'camera.viewfinder_instruction': 'Di chuyển mã QR vào giữa khung ngắm',
    'camera.scan_again': 'Quét lại',
    'camera.confirm_point': 'Xác nhận điểm này',
    'camera.identified_qr': 'NHẬN DIỆN MÃ QR',
    'camera.pending_body': 'Mã QR xác thực vị trí con ngõ. Bạn bấm xác nhận để bắt đầu nghe lời kể.',
    'camera.manual_selection': 'Hoặc chọn điểm bằng tay',
    'camera.manual_hint': 'Luôn sẵn sàng sử dụng kể cả khi camera bận hoặc trong điều kiện ánh sáng yếu:',
    'camera.choose_manual': 'Chọn điểm {name} bằng tay',
    'camera.scanning': 'Đang quét mã QR…',
    'camera.permission_denied': 'Chưa được cấp quyền camera. Bạn vẫn có thể chọn điểm bằng tay bên dưới.',
    'camera.permission_blocked': 'Quyền camera đã bị từ chối trong cài đặt hệ thống. Hãy chọn điểm bằng tay bên dưới.',
    'camera.unrecognized_qr': 'Không nhận mã này. Bạn có thể quét lại hoặc chọn điểm bằng tay.',
    'camera.choose_another_stop': '← Chọn điểm khác trên sổ tay',

    'location.title': 'Xác nhận điểm GPS',
    'location.find_button': 'Tìm điểm gần nhất qua GPS',
    'location.waiting': 'Đang đọc tọa độ GPS…',
    'location.stop_waiting': 'Dừng tìm',
    'location.confirm_button': 'Xác nhận điểm này',
    'location.manual_list': 'Danh sách điểm dừng',
    'location.nearest_candidate': 'GỢI Ý TỪ GPS',
    'location.distance_hint': 'Khoảng cách: ~{meters}',
    'location.err_poor_accuracy': 'Tín hiệu GPS yếu (~{meters}), nên app không đoán điểm nào. Hãy thử lại ở nơi thoáng trời hoặc chọn điểm bằng tay bên dưới.',
    'location.err_outside': 'Bạn đang cách điểm gần nhất khoảng {meters}, vượt ngoài phạm vi ngõ demo. Hãy chọn điểm bằng tay.',
    'location.err_no_coords': 'Điểm này chưa có tọa độ GPS. Hãy chọn điểm trên danh sách bằng tay.',
    'location.err_needs_position': 'Chưa nhận được vị trí thiết bị. Vui lòng bấm thử lại hoặc chọn điểm bằng tay.',

    'unavailable.phase': 'Thông báo dữ liệu',
    'unavailable.title': 'Chưa có dữ liệu hỏi đáp',
    'unavailable.note': 'Vui lòng chuyển về chế độ Demo để trải nghiệm toàn bộ các tính năng được mô phỏng sẵn.',
  },
  en: {
    'voice.error.MIC_PERMISSION_DENIED': "Ngõ Kể doesn't have permission to use the microphone. You can type your question instead.",
    'voice.error.MIC_PERMISSION_BLOCKED': 'Microphone permission is blocked in Settings. Enable microphone access or type your question instead.',
    'voice.error.AUDIO_TOO_SHORT': 'The recording was too short. Please speak your question clearly and tap Send.',
    'voice.error.RECORDER_START_FAILED': 'Could not start microphone recording. Tap to try again.',
    'voice.error.AUDIO_PLAYER_STOP_TIMEOUT': 'Playback has not stopped yet. Please try again in a moment.',
    'voice.error.AUDIO_TOO_LONG': 'The recording was too long. Please try asking a shorter question.',
    'voice.error.NO_SPEECH': 'No clear speech detected. Please try again closer to the microphone.',
    'voice.error.VOICE_NOT_CONFIGURED': 'Voice server is not configured in this test build. Please relaunch or type your question instead.',
    'voice.error.ASR_TIMEOUT': 'Speech recognition timed out. Please try again with a stable connection.',
    'voice.error.ASR_UNAVAILABLE': 'Speech recognition service is unavailable. Please try again later.',
    'voice.error.ASR_BUSY': 'Speech recognition is currently busy. Please wait a moment and try again.',
    'voice.error.RATE_LIMITED': 'Too many consecutive requests. Please wait a moment and try again.',
    'voice.error.INVALID_AUDIO': 'The audio recording could not be read. Please record your question again.',
    'voice.error.UNSUPPORTED_LOCALE': 'Language not supported for voice recognition.',
    'voice.error.DEFAULT': 'Could not send question. Check your connection to the voice server and try again.',

    'voice.notice.last_chapter': 'This is the last available chapter.',
    'voice.notice.playback_stopped': 'Playback stopped.',
    'voice.notice.stop_pending': 'Playback has not stopped yet. Please try again in a moment.',
    'voice.notice.live_no_audio': 'Live stories do not have voice recordings yet. You can read the text or select a suggested question.',
    'voice.notice.live_answer_no_audio': 'Live answers do not have voice recordings. Tap “Read text” to view the answer.',
    'voice.notice.answer_matched_read_text': 'Answer matched. Audio is not available in Live mode; tap “Read text” to view.',
    'voice.notice.reference_missing': 'No previous question list available to determine which was “first”. Please select a question below.',
    'voice.notice.reference_changed': 'The question list has changed. Please select a question below.',
    'voice.notice.audio_unavailable': 'Audio recording is unavailable. You can still read the story text.',
    'voice.notice.quota_exceeded': 'Maximum {seconds} seconds reached. Tap Send to continue or Cancel to record again.',

    'voice.intent.clarify_action': 'Do you want to hear the answer or perform the action you just said?',
    'voice.intent.clarify_plan': 'Do you want to ask about an experience or open the route planner?',
    'voice.intent.clarify_plan_question': 'Do you want to ask about an experience or open the route planner?',
    'voice.intent.ambiguous_topic_multiple': 'I heard more than one topic. Please choose one topic below.',
    'voice.intent.ambiguous_topic_negation': 'Cannot choose a topic automatically when the request contains a negation. Please tap a topic below.',
    'voice.intent.ambiguous_duration_unrecognized': 'Could not recognize the duration. Please select the number of minutes below.',
    'voice.intent.ambiguous_duration_multiple': 'I heard more than one time duration. Please select one duration below.',
    'voice.intent.ambiguous_duration_range': 'Duration must be between 1 and 180 minutes. Please select again below.',

    'voice.stage.preparing': 'Enabling microphone.',
    'voice.stage.recording': 'Recording your question. Tap Send when finished or Cancel to discard.',
    'voice.stage.ready': 'Recording finished. Tap Send to continue or Cancel to discard.',
    'voice.stage.stopping': 'Saving recording.',
    'voice.stage.transcribing': 'Processing question.',

    'voice.dock.toolbar': 'Ask the storyteller',
    'voice.dock.start_recording': 'Start voice question',
    'voice.dock.retry_recording': 'Retry voice question',
    'voice.dock.recording': 'Recording · {duration}',
    'voice.dock.meter_label': 'Recording audio level',
    'voice.dock.ready': 'Recording finished · {duration}',
    'voice.dock.ready_subtitle': 'Tap Send to ask',
    'voice.dock.preparing': 'Enabling microphone…',
    'voice.dock.stopping': 'Saving recording…',
    'voice.dock.transcribing': 'Listening to question…',
    'voice.dock.error_title': 'Retry with voice',
    'voice.dock.idle_title': 'Tap to ask',
    'voice.dock.busy_subtitle': 'You can cancel anytime',
    'voice.dock.idle_subtitle': 'Say “Play story” and ask',
    'voice.dock.submit': 'Send question',
    'voice.dock.cancel': 'Cancel',
    'voice.dock.btn_submit': 'Send',
    'voice.dock.btn_cancel': 'Cancel',
    'voice.dock.open_settings': 'Open Settings',
    'voice.dock.type_question': 'Open text input',

    'player.play': 'Play {label}',
    'player.pause': 'Pause story',
    'player.ready': 'Ready',
    'player.replay': 'Replay {label}',
    'player.stop': 'Stop {label}',
    'player.progress': 'Playback progress {percent} percent',

    'drawer.title': 'Ask the storyteller',
    'drawer.placeholder': 'Type a question about this alley…',
    'drawer.close_backdrop': 'Close question input',
    'drawer.collapse': 'Collapse input drawer',
    'drawer.send': 'Send question',
    'drawer.btn_send': 'Send',
    'drawer.suggestions_title': 'Quick suggestions:',
    'drawer.select_suggestion': 'Select question: {question}',

    'live.reason.no_config.title': 'Live mode not configured',
    'live.reason.no_config.detail': 'No backend URL configured for Live mode. App will not fall back to demo data or fabricate content. Configure EXPO_PUBLIC_NGOKE_API_BASE_URL or app.json extra.apiBaseUrl and tap “Retry”.',
    'live.reason.no_data.title': 'Live mode has no data',
    'live.reason.no_data.detail': 'Server returned no reviewed points. App remains in Live mode without borrowing demo data.',
    'live.reason.shape.title': 'Invalid live dataset format',
    'live.reason.shape.detail': 'Returned data does not match the schema or lacks sources. App refuses to display unverified content.',
    'live.reason.http.title': 'Live server error',
    'live.reason.http.detail': 'Server did not return valid data. Tap “Retry” when the server is ready.',
    'live.reason.network.title': 'Cannot connect to live server',
    'live.reason.network.detail': 'Check your network connection or backend URL and tap “Retry”.',
    'live.reason.timeout.title': 'Live server timed out',
    'live.reason.timeout.detail': 'No response after 8 seconds. Tap “Retry”.',

    'common.close': 'Close',
    'common.back': 'Back',
    'common.cancel': 'Cancel',
    'common.send': 'Send',
    'common.retry': 'Retry',
    'common.loading': 'Loading…',
    'common.demo': 'Demo',
    'common.live': 'Live',
    'common.simulated': 'Simulated',
    'common.reviewed': 'Reviewed',
    'common.error': 'Error',
    'common.empty': 'No data',
    'common.stop_count': '{count} stops',
    'common.chapter_count': '{count} chapters',
    'common.change_language': 'Change language',
    'common.switch_to_demo': 'Switch to Demo',
    'common.minutes': '{minutes} min',
    'common.photo_disclaimer': 'Illustration photo · simulated point',
    'common.photo_author': 'Photo: {author}',
    'common.visited_stamp': 'VISITED',
    'common.simulated_minutes': '{minutes} min simulated',
    'common.explore_this_point': 'Explore this stop',
    'common.narrator_label': '2D Storyteller placeholder',

    'prologue.eyebrow': 'A PAGE OF HANOI MEMORIES',
    'prologue.title': 'NGÕ KỂ',
    'prologue.subtitle': 'MEMORIES OF HANOI ALLEYS',
    'prologue.quote': '“In the early morning shade, the alley wakes,\nwhispering stories deep within the Old Quarter.”',
    'prologue.start_button': 'START JOURNEY',
    'prologue.start_label': 'Start exploring Hanoi alleys',
    'prologue.hint': 'Tap to begin the alley journey',
    'prologue.lang_vi': 'Tiếng Việt',
    'prologue.lang_en': 'English',

    'collection.fiction_letter.name': 'Hang But Street - A Fiction Letter',
    'collection.fiction_letter.tagline': 'A 6-chapter fictional adventure',
    'collection.fiction_letter.theme': 'Old Stories',
    'collection.fiction_letter.district': 'Hoan Kiem, Hanoi',
    'collection.old_quarter_pilot.name': 'Old Quarter Pilot',
    'collection.old_quarter_pilot.tagline': '3 historical stops with verified sources',
    'collection.old_quarter_pilot.theme': 'Heritage',
    'collection.old_quarter_pilot.district': 'Old Quarter, Hoan Kiem',

    'landing.soundscape_banner': 'Text stories · simulated content · {mode}',
    'landing.featured_section_pre': 'FEATURED JOURNEYS',
    'landing.featured_section_title': 'Choose an alley',
    'landing.see_all': 'See all ›',
    'landing.see_all_label': 'See all alleys',
    'landing.passport_title': 'Alley Passport',
    'landing.passport_desc': 'View notebook sample · visit history not saved',
    'landing.passport_open_label': 'Open Alley Passport',
    'landing.passport_guide': 'This is a sample notebook. Demo does not yet save visit history; stops below are unconfirmed.',
    'landing.passport_phase': 'HERITAGE COLLECTION',
    'landing.badge_sample': 'SAMPLE',

    'alley_select.title': 'Alley Collection',
    'alley_select.subtitle': 'Choose a journey to start exploring',
    'alley_select.open_label': 'Open {name}',
    'alley_select.meta_info': 'Cover photo · {count} stops · {mode}',
    'alley_select.demo_area': 'DEMO AREA',
    'alley_select.demo_subtext': 'Hanoi Old Quarter · simulated content',
    'alley_select.search_placeholder': 'Search street or alley',
    'alley_select.clear_search': 'Clear search',
    'alley_select.hint': 'Select an alley cover below to open stops from {mode} source',
    'alley_select.explore_count': 'Explorable alleys ({count})',
    'alley_select.sample_list': 'Sample list · distance not measured from you',
    'alley_select.empty': 'No matching address or alley found',
    'alley_select.reset_filter': 'See all alleys ›',

    'home.open_story': 'View {name}',
    'home.stories_opened': 'Opened {opened}/{total} stories · {mode}',
    'home.explore_current': 'Explore this stop',
    'home.unopened': 'Unopened',
    'home.opened': 'Opened',
    'home.menu_title': 'Options',
    'home.language_selector': 'Language',

    'qa.read_text': 'Read text',
    'qa.collapse_text': 'Collapse text',
    'qa.prev_stop': '‹ Previous stop',
    'qa.prev_stop_label': 'Previous stop',
    'qa.next_stop': 'Next stop ›',
    'qa.next_stop_label': 'Next stop',
    'qa.ask_header': 'Ask the storyteller',
    'qa.answer_evidence': 'Evidence',
    'qa.follow_ups_header': 'Follow-up questions',
    'qa.source_disclaimer': 'Source',
    'qa.photo_note': 'Illustration photo',
    'qa.photographer': 'Photographer',
    'qa.type_question_placeholder': 'Type your question…',
    'qa.open_camera': 'Open camera',
    'qa.open_location': 'Open location',
    'qa.open_plan': 'Plan experience',
    'qa.missing_audio': 'Audio recording is unavailable for this content. You can still read the text.',
    'qa.no_match': 'No data available for this question. Try selecting a suggested question below.',

    'plan.title': 'Choose experience',
    'plan.subtitle': 'Choose a topic and time budget for route recommendations',
    'plan.topic_header': 'Topic',
    'plan.time_header': 'Time budget',
    'plan.topic_food': 'Alley food',
    'plan.topic_history': 'Old stories & heritage',
    'plan.topic_explore': 'Free exploration',
    'plan.custom_topic': 'Other topic',
    'plan.custom_time': 'Other duration',
    'plan.recommendations_header': 'Suggested stops',
    'plan.recommendations_empty': 'No stops match your selection.',
    'plan.go_to_stop': 'Go to this stop',
    'plan.estimated_time': '~{minutes} min',
    'plan.toggle_manual': '⌨ Enter custom topic or duration...',
    'plan.custom_topic_placeholder': 'Type: food, old stories...',
    'plan.apply_button': 'Use',
    'plan.topic_hint': 'Topic not recognized. Try “food”, “old stories”, or “free exploration”.',
    'plan.custom_time_placeholder': 'e.g. 30 minutes, 1 hour...',
    'plan.time_hint': 'Duration not recognized. Try 30 minutes or 1 hour.',

    'camera.title': 'Camera & storyteller',
    'camera.phase': 'Augmented lens · QR Scan & Story',
    'camera.main_title': 'Spatial touchpoint',
    'camera.subtitle': 'Scan QR code in the alley or select on passport to read stories on site.',
    'camera.camera_on': 'Lens is active',
    'camera.camera_off': 'Camera is off',
    'camera.camera_on_hint': 'Point camera at the QR code to activate the storyteller.',
    'camera.camera_off_hint': 'Privacy respected: camera only turns on when you tap the button below.',
    'camera.enable_button': 'Enable camera & scan QR',
    'camera.turn_off_button': 'Turn off camera',
    'camera.viewfinder_instruction': 'Align QR code within the viewfinder',
    'camera.scan_again': 'Scan again',
    'camera.confirm_point': 'Confirm this stop',
    'camera.identified_qr': 'QR CODE IDENTIFIED',
    'camera.pending_body': 'QR verified the alley location. Tap confirm to start hearing the story.',
    'camera.manual_selection': 'Or select manually',
    'camera.manual_hint': 'Always ready even when camera is unavailable or in low light:',
    'camera.choose_manual': 'Select {name} manually',
    'camera.scanning': 'Scanning QR code…',
    'camera.permission_denied': 'Camera permission not granted. You can select a stop manually below.',
    'camera.permission_blocked': 'Camera permission is blocked in settings. Please select a stop manually below.',
    'camera.unrecognized_qr': 'Unrecognized code. You can scan again or select manually.',
    'camera.choose_another_stop': '← Choose another stop from passport',

    'location.title': 'Confirm GPS stop',
    'location.find_button': 'Find nearest stop via GPS',
    'location.waiting': 'Reading GPS coordinates…',
    'location.stop_waiting': 'Stop searching',
    'location.confirm_button': 'Confirm this stop',
    'location.manual_list': 'List of stops',
    'location.nearest_candidate': 'SUGGESTED BY GPS',
    'location.distance_hint': 'Distance: ~{meters}',
    'location.err_poor_accuracy': 'GPS accuracy is weak (~{meters}). Please retry outdoors or select a stop manually below.',
    'location.err_outside': 'You are about {meters} from the nearest stop, outside the tour area. Please select manually.',
    'location.err_no_coords': 'This stop has no GPS coordinates yet. Please select manually from the list.',
    'location.err_needs_position': 'Cannot determine device location. Please retry or select manually.',

    'unavailable.phase': 'Data notice',
    'unavailable.title': 'Q&A data not available',
    'unavailable.note': 'Please switch to Demo mode to explore all simulated features.',
  },
};

/**
 * Pure translation function with optional parameter substitution ({param}).
 * Zero dependencies on React/Expo - fully runnable in Node.js runtime.
 */
export function translate(
  locale: Locale,
  key: TranslationKey | (string & Record<never, never>),
  params?: Record<string, string | number>,
): string {
  const dict = DICTIONARY[locale] ?? DICTIONARY.vi;
  let text = dict[key as TranslationKey];
  if (text === undefined) {
    text = DICTIONARY.vi[key as TranslationKey] ?? key;
  }
  if (params) {
    for (const [pKey, pVal] of Object.entries(params)) {
      text = text.replace(new RegExp(`\\{${pKey}\\}`, 'g'), String(pVal));
    }
  }
  return text;
}

export const t = translate;
