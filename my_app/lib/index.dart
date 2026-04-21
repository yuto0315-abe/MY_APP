import 'package:flutter/material.dart';
import 'package:intl/intl.dart';
import 'package:intl/date_symbol_data_local.dart';
import 'package:syncfusion_flutter_calendar/calendar.dart';

Future<void> main() async {
  WidgetsFlutterBinding.ensureInitialized();
  await initializeDateFormatting('ja_JP');
  Intl.defaultLocale = 'ja_JP';
  runApp(const CalendarApp());
}

class CalendarApp extends StatefulWidget {
  const CalendarApp({super.key});

  @override
  State<CalendarApp> createState() => _CalendarAppState();
}

class _CalendarAppState extends State<CalendarApp> {
  bool _isDarkMode = false;

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      theme: ThemeData(
        colorScheme: ColorScheme.fromSeed(seedColor: Colors.deepPurple),
        useMaterial3: true,
      ),
      darkTheme: ThemeData(
        colorScheme: ColorScheme.fromSeed(
          seedColor: Colors.deepPurple,
          brightness: Brightness.dark,
        ),
        useMaterial3: true,
      ),
      themeMode: _isDarkMode ? ThemeMode.dark : ThemeMode.light,
      home: LookOnlyCalendar(
        isDarkMode: _isDarkMode,
        onDarkModeChanged: (bool value) {
          setState(() {
            _isDarkMode = value;
          });
        },
      ),
    );
  }
}

class LookOnlyCalendar extends StatefulWidget {
  const LookOnlyCalendar({super.key, this.isDarkMode, this.onDarkModeChanged});

  final bool? isDarkMode;
  final ValueChanged<bool>? onDarkModeChanged;

  @override
  State<LookOnlyCalendar> createState() => _LookOnlyCalendarState();
}

class _LookOnlyCalendarState extends State<LookOnlyCalendar> {
  final CalendarController _calendarController = CalendarController();
  late final List<_AppointmentRecord> _appointmentRecords;
  DateTime _displayDate = DateTime.now();
  CalendarView _calendarView = CalendarView.day;

  @override
  void initState() {
    super.initState();
    _calendarController.view = _calendarView;
    _calendarController.displayDate = _displayDate;
    final DateTime now = DateTime.now();
    _appointmentRecords = <_AppointmentRecord>[
      _AppointmentRecord(
        appointment: Appointment(
          startTime: DateTime(now.year, now.month, now.day, 10, 0),
          endTime: DateTime(now.year, now.month, now.day, 12, 0),
          subject: '専門演習 (3・4限)',
          color: Colors.blue.shade700,
        ),
        ownerName: '山田 太郎',
        participants: <String>['山田 太郎', '佐藤 花子', '鈴木 一郎'],
        category: '授業',
        location: '講義棟 302教室',
        notification: '15分前',
        description: '専門演習のグループワークと進捗確認を行います。',
      ),
      _AppointmentRecord(
        appointment: Appointment(
          startTime: DateTime(now.year, now.month, now.day + 1, 14, 0),
          endTime: DateTime(now.year, now.month, now.day + 1, 15, 0),
          subject: '〇〇社 Web面接',
          color: Colors.orange.shade800,
        ),
        ownerName: '山田 太郎',
        participants: <String>['採用担当: 田中様', '山田 太郎'],
        category: '面接',
        location: 'オンライン (Zoom)',
        notification: '30分前 / 10分前',
        description: '一次面接。接続確認を事前に行ってください。',
      ),
    ];
  }

  @override
  void dispose() {
    _calendarController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      drawer: Drawer(
        child: SafeArea(
          child: ListView(
            padding: EdgeInsets.zero,
            children: [
              const ListTile(
                leading: CircleAvatar(child: Icon(Icons.settings)),
                title: Text(
                  'メニュー',
                  style: TextStyle(fontWeight: FontWeight.bold),
                ),
              ),
              const Divider(height: 1),
              _buildDrawerItem(
                icon: Icons.account_circle_outlined,
                title: 'アカウント情報',
              ),
              _buildDrawerItem(
                icon: Icons.edit_calendar_outlined,
                title: '予定編集',
              ),
              SwitchListTile(
                secondary: const Icon(Icons.dark_mode_outlined),
                title: const Text('ダークモード'),
                value: widget.isDarkMode ?? false,
                onChanged: (bool value) {
                  widget.onDarkModeChanged?.call(value);
                },
              ),
            ],
          ),
        ),
      ),
      appBar: AppBar(
        leading: Builder(
          builder: (BuildContext context) {
            return IconButton(
              icon: const Icon(Icons.settings),
              tooltip: 'メニュー',
              onPressed: () => Scaffold.of(context).openDrawer(),
            );
          },
        ),
        title: const Text(
          'カレンダー',
          style: TextStyle(fontWeight: FontWeight.bold),
        ),
        toolbarHeight: 44,
        titleSpacing: 12,
        centerTitle: false,
        backgroundColor: Colors.white,
        foregroundColor: Colors.black,
        elevation: 0,
      ),
      body: Column(
        children: [
          Padding(
            padding: const EdgeInsets.fromLTRB(12, 8, 12, 0),
            child: Row(
              children: [
                Text(
                  _monthYearLabel(_displayDate),
                  style: const TextStyle(
                    fontWeight: FontWeight.w500,
                    fontSize: 14,
                  ),
                ),
                const Spacer(),
                OutlinedButton.icon(
                  onPressed: _pickDate,
                  icon: const Icon(Icons.calendar_month, size: 16),
                  label: Text(
                    '${_displayDate.month}月${_displayDate.day}日',
                    style: const TextStyle(fontWeight: FontWeight.w600),
                  ),
                ),
                IconButton(
                  tooltip: '1日前へ',
                  onPressed: () => _moveDisplayDate(-1),
                  icon: const Icon(Icons.chevron_left),
                ),
                Container(
                  decoration: BoxDecoration(
                    color: Colors.grey.shade100,
                    borderRadius: BorderRadius.circular(10),
                  ),
                  child: Row(
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      InkWell(
                        borderRadius: BorderRadius.circular(10),
                        onTap: () => _changeCalendarView(CalendarView.day),
                        child: Container(
                          padding: const EdgeInsets.symmetric(
                            horizontal: 10,
                            vertical: 6,
                          ),
                          decoration: BoxDecoration(
                            color: _calendarView == CalendarView.day
                                ? Colors.grey.shade300
                                : Colors.transparent,
                            borderRadius: BorderRadius.circular(10),
                          ),
                          child: const Text('1日'),
                        ),
                      ),
                      InkWell(
                        borderRadius: BorderRadius.circular(10),
                        onTap: () => _changeCalendarView(CalendarView.month),
                        child: Container(
                          padding: const EdgeInsets.symmetric(
                            horizontal: 10,
                            vertical: 6,
                          ),
                          decoration: BoxDecoration(
                            color: _calendarView == CalendarView.month
                                ? Colors.grey.shade300
                                : Colors.transparent,
                            borderRadius: BorderRadius.circular(10),
                          ),
                          child: const Text('月'),
                        ),
                      ),
                    ],
                  ),
                ),
                IconButton(
                  tooltip: '1日後へ',
                  onPressed: () => _moveDisplayDate(1),
                  icon: const Icon(Icons.chevron_right),
                ),
              ],
            ),
          ),
          if (_calendarView == CalendarView.day)
            SizedBox(
              height: 72,
              child: Padding(
                padding: const EdgeInsets.fromLTRB(12, 6, 12, 6),
                child: Row(
                  children: _weekDates.map((DateTime date) {
                    final bool isSelected = _isSameDate(date, _displayDate);
                    final bool isToday = _isSameDate(date, DateTime.now());

                    return Expanded(
                      child: Padding(
                        padding: const EdgeInsets.symmetric(horizontal: 3),
                        child: InkWell(
                          borderRadius: BorderRadius.circular(12),
                          onTap: () => _selectDisplayDate(date),
                          child: Container(
                            decoration: BoxDecoration(
                              color: isSelected
                                  ? Colors.orangeAccent
                                  : Colors.white,
                              borderRadius: BorderRadius.circular(12),
                              border: Border.all(
                                color: isToday
                                    ? Colors.orangeAccent
                                    : Colors.black12,
                                width: isToday ? 1.5 : 1,
                              ),
                            ),
                            padding: const EdgeInsets.symmetric(vertical: 7),
                            child: Column(
                              mainAxisAlignment: MainAxisAlignment.spaceBetween,
                              children: [
                                Text(
                                  _weekdayLabel(date),
                                  style: TextStyle(
                                    fontSize: 10,
                                    fontWeight: FontWeight.w700,
                                    color: isSelected
                                        ? Colors.white
                                        : Colors.black54,
                                  ),
                                ),
                                Text(
                                  '${date.day}',
                                  style: TextStyle(
                                    fontSize: 18,
                                    fontWeight: FontWeight.w700,
                                    color: isSelected
                                        ? Colors.white
                                        : Colors.black87,
                                  ),
                                ),
                              ],
                            ),
                          ),
                        ),
                      ),
                    );
                  }).toList(),
                ),
              ),
            ),
          Expanded(
            child: SfCalendar(
              key: ValueKey<CalendarView>(_calendarView),
              controller: _calendarController,
              view: _calendarView,
              firstDayOfWeek: 1, // 月曜始まり
              headerHeight: _calendarView == CalendarView.month ? 46 : 0,
              viewHeaderHeight: _calendarView == CalendarView.month ? 30 : 0,
              todayHighlightColor: Colors.orangeAccent,
              cellBorderColor: Colors.grey.withOpacity(0.1),
              timeSlotViewSettings: TimeSlotViewSettings(
                timeFormat: 'H',
                timeRulerSize: 42,
              ),
              monthViewSettings: MonthViewSettings(
                showAgenda: false,
                navigationDirection: MonthNavigationDirection.vertical,
                appointmentDisplayMode: MonthAppointmentDisplayMode.appointment,
                numberOfWeeksInView: 6,
                appointmentDisplayCount: 3,
                dayFormat: 'E',
                monthCellStyle: const MonthCellStyle(
                  textStyle: TextStyle(fontWeight: FontWeight.w500),
                ),
              ),

              // 日表示だけ予定をカード風にする
              appointmentBuilder: _calendarView == CalendarView.day
                  ? (context, details) {
                      final Appointment meeting = details.appointments.first;
                      return Container(
                        decoration: BoxDecoration(
                          color: meeting.color.withOpacity(0.8),
                          borderRadius: BorderRadius.circular(8),
                          border: Border.all(color: Colors.white, width: 1),
                        ),
                        padding: const EdgeInsets.all(4),
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text(
                              meeting.subject,
                              style: const TextStyle(
                                color: Colors.white,
                                fontWeight: FontWeight.bold,
                                fontSize: 12,
                              ),
                              overflow: TextOverflow.ellipsis,
                            ),
                            const Spacer(),
                            const Icon(
                              Icons.touch_app,
                              color: Colors.white,
                              size: 14,
                            ),
                          ],
                        ),
                      );
                    }
                  : null,
              dataSource: _getDataSource(),

              // タップした時の見た目（仮のポップアップ）
              onTap: (CalendarTapDetails details) {
                if (_calendarView == CalendarView.day &&
                    details.targetElement == CalendarElement.appointment &&
                    details.appointments != null &&
                    details.appointments!.isNotEmpty) {
                  final Object tapped = details.appointments!.first;
                  if (tapped is Appointment) {
                    final _AppointmentRecord? record = _findRecord(tapped);
                    if (record != null) {
                      _openAppointmentDetail(record);
                    }
                  }
                  return;
                }

                if (details.date == null) {
                  return;
                }

                if (details.targetElement != CalendarElement.calendarCell) {
                  return;
                }

                if (_calendarView == CalendarView.month) {
                  _openDayViewForDate(details.date!);
                  return;
                }

                _selectDisplayDate(details.date!);
              },
              onViewChanged: (ViewChangedDetails details) {
                if (_calendarView != CalendarView.day) {
                  return;
                }
                if (details.visibleDates.isEmpty) {
                  return;
                }
                final DateTime newDate = details.visibleDates.first;
                if (_isSameDate(newDate, _displayDate)) {
                  return;
                }
                setState(() {
                  _displayDate = DateTime(
                    newDate.year,
                    newDate.month,
                    newDate.day,
                  );
                });
              },
            ),
          ),
        ],
      ),
    );
  }

  List<DateTime> get _weekDates {
    final DateTime base = _startOfWeek(_displayDate);
    return List<DateTime>.generate(
      7,
      (int index) => base.add(Duration(days: index)),
    );
  }

  Widget _buildDrawerItem({required IconData icon, required String title}) {
    return ListTile(
      leading: Icon(icon),
      title: Text(title),
      onTap: () => _openMenuPage(title),
    );
  }

  void _openMenuPage(String title) {
    Navigator.of(context).pop();
    if (title == 'アカウント情報') {
      Navigator.of(context).push(
        MaterialPageRoute<void>(
          builder: (BuildContext context) => const _AccountInfoPage(),
        ),
      );
      return;
    }
    Navigator.of(context).push(
      MaterialPageRoute<void>(
        builder: (BuildContext context) => _MenuPage(title: title),
      ),
    );
  }

  DateTime _startOfWeek(DateTime date) {
    final DateTime normalized = DateTime(date.year, date.month, date.day);
    return normalized.subtract(Duration(days: normalized.weekday - 1));
  }

  void _moveDisplayDate(int days) {
    final DateTime base = _calendarController.displayDate ?? _displayDate;
    late final DateTime next;

    if (_calendarView == CalendarView.month) {
      final DateTime movedMonth = DateTime(base.year, base.month + days, 1);
      final int lastDay = DateTime(
        movedMonth.year,
        movedMonth.month + 1,
        0,
      ).day;
      final int targetDay = base.day <= lastDay ? base.day : lastDay;
      next = DateTime(movedMonth.year, movedMonth.month, targetDay);
    } else {
      next = DateTime(
        base.year,
        base.month,
        base.day,
      ).add(Duration(days: days));
    }
    _selectDisplayDate(next);
  }

  void _changeCalendarView(CalendarView view) {
    setState(() {
      _calendarView = view;
      _calendarController.view = view;
    });
  }

  void _openDayViewForDate(DateTime date) {
    final DateTime normalized = DateTime(date.year, date.month, date.day);
    setState(() {
      _displayDate = normalized;
      _calendarView = CalendarView.day;
      _calendarController.displayDate = normalized;
      _calendarController.view = CalendarView.day;
    });
  }

  void _openAppointmentDetail(_AppointmentRecord record) {
    Navigator.of(context).push(
      MaterialPageRoute<void>(
        builder: (BuildContext context) =>
            _AppointmentDetailPage.withRecord(record: record),
      ),
    );
  }

  Future<void> _pickDate() async {
    final DateTime? picked = await showDatePicker(
      context: context,
      initialDate: _displayDate,
      firstDate: DateTime(2000),
      lastDate: DateTime(2100),
    );

    if (picked == null) {
      return;
    }

    final DateTime normalized = DateTime(picked.year, picked.month, picked.day);
    _selectDisplayDate(normalized);
  }

  void _selectDisplayDate(DateTime date) {
    final DateTime normalized = DateTime(date.year, date.month, date.day);
    setState(() {
      _displayDate = normalized;
      _calendarController.displayDate = normalized;
    });
  }

  bool _isSameDate(DateTime a, DateTime b) {
    return a.year == b.year && a.month == b.month && a.day == b.day;
  }

  String _weekdayLabel(DateTime date) {
    const List<String> labels = <String>[
      'MON',
      'TUE',
      'WED',
      'THU',
      'FRI',
      'SAT',
      'SUN',
    ];
    return labels[date.weekday - 1];
  }

  String _monthYearLabel(DateTime date) {
    return DateFormat.yMMMM('ja_JP').format(date);
  }

  // サンプルデータ（見た目確認用）
  _DataSource _getDataSource() {
    final List<Appointment> appointments = _appointmentRecords
        .map((_AppointmentRecord record) => record.appointment)
        .toList();
    return _DataSource(appointments);
  }

  _AppointmentRecord? _findRecord(Appointment appointment) {
    for (final _AppointmentRecord record in _appointmentRecords) {
      if (record.appointment.startTime == appointment.startTime &&
          record.appointment.endTime == appointment.endTime &&
          record.appointment.subject == appointment.subject) {
        return record;
      }
    }
    return null;
  }
}

class _DataSource extends CalendarDataSource {
  _DataSource(List<Appointment> source) {
    appointments = source;
  }
}

class _AppointmentRecord {
  _AppointmentRecord({
    required this.appointment,
    required this.ownerName,
    required this.participants,
    required this.category,
    required this.location,
    required this.notification,
    required this.description,
  });

  final Appointment appointment;
  final String ownerName;
  final List<String> participants;
  final String category;
  final String location;
  final String notification;
  final String description;
}

class _AppointmentDetailPage extends StatelessWidget {
  const _AppointmentDetailPage() : record = null;

  const _AppointmentDetailPage.withRecord({required this.record});

  final _AppointmentRecord? record;

  @override
  Widget build(BuildContext context) {
    final DateFormat formatter = DateFormat('yyyy/MM/dd(E) HH:mm', 'ja_JP');

    return Scaffold(
      appBar: AppBar(title: const Text('予定の詳細')),
      body: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              record?.appointment.subject ?? '予定の詳細',
              style: const TextStyle(fontSize: 20, fontWeight: FontWeight.bold),
            ),
            const SizedBox(height: 16),
            _DetailRow(
              label: '開始',
              value: record == null
                  ? '未設定'
                  : formatter.format(record!.appointment.startTime),
            ),
            const SizedBox(height: 8),
            _DetailRow(
              label: '終了',
              value: record == null
                  ? '未設定'
                  : formatter.format(record!.appointment.endTime),
            ),
            const SizedBox(height: 8),
            _DetailRow(label: '担当者', value: record?.ownerName ?? '未設定'),
            const SizedBox(height: 8),
            _DetailRow(label: '種別', value: record?.category ?? '未設定'),
            if ((record?.location ?? '').isNotEmpty) ...[
              const SizedBox(height: 8),
              _DetailRow(label: '場所', value: record!.location),
            ],
            const SizedBox(height: 8),
            _DetailRow(
              label: '参加者',
              value: record?.participants.join(' / ') ?? '未設定',
            ),
            const SizedBox(height: 8),
            _DetailRow(label: '通知', value: record?.notification ?? '未設定'),
            const SizedBox(height: 8),
            _DetailRow(label: 'メモ', value: record?.description ?? '未設定'),
          ],
        ),
      ),
    );
  }
}

class _DetailRow extends StatelessWidget {
  const _DetailRow({required this.label, required this.value});

  final String label;
  final String value;

  @override
  Widget build(BuildContext context) {
    return Row(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        SizedBox(
          width: 52,
          child: Text(label, style: TextStyle(color: Colors.grey.shade700)),
        ),
        Expanded(child: Text(value)),
      ],
    );
  }
}

class _MenuPage extends StatelessWidget {
  const _MenuPage({required this.title});

  final String title;

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: Text(title)),
      body: Center(
        child: Text(
          '$title 画面',
          style: const TextStyle(fontSize: 18, fontWeight: FontWeight.w600),
        ),
      ),
    );
  }
}

class _AccountInfoPage extends StatelessWidget {
  const _AccountInfoPage();

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('アカウント情報')),
      body: ListView(
        children: [
          const ListTile(
            leading: Icon(Icons.account_circle_outlined),
            title: Text('アカウント概要'),
            subtitle: Text('登録情報や連携状態を確認できます'),
          ),
          const Divider(height: 1),
          _AccountSectionTile(
            icon: Icons.shield_outlined,
            title: 'セキュリティ',
            subtitle: 'ログイン保護や認証設定',
          ),
          _AccountSectionTile(
            icon: Icons.link_outlined,
            title: '他アカウントサービス',
            subtitle: '外部サービスとの連携管理',
          ),
          _AccountSectionTile(
            icon: Icons.badge_outlined,
            title: 'ID設定',
            subtitle: 'ログインIDの確認・変更',
          ),
          _AccountSectionTile(
            icon: Icons.key_outlined,
            title: 'Pass設定',
            subtitle: 'パスワード変更と管理',
          ),
          _AccountSectionTile(
            icon: Icons.pin_outlined,
            title: 'PIN設定',
            subtitle: 'PINコードによる簡易認証',
          ),
        ],
      ),
    );
  }
}

class _AccountSectionTile extends StatelessWidget {
  const _AccountSectionTile({
    required this.icon,
    required this.title,
    required this.subtitle,
  });

  final IconData icon;
  final String title;
  final String subtitle;

  @override
  Widget build(BuildContext context) {
    return ListTile(
      leading: Icon(icon),
      title: Text(title),
      subtitle: Text(subtitle),
      trailing: const Icon(Icons.chevron_right),
      onTap: () {
        ScaffoldMessenger.of(
          context,
        ).showSnackBar(SnackBar(content: Text('$title は準備中です')));
      },
    );
  }
}
