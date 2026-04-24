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
  late final Map<String, _AppointmentRecord> _appointmentRecordIndex;
  final DateFormat _monthYearFormatter = DateFormat.yMMMM('ja_JP');
  DateTime _displayDate = DateTime.now();
  CalendarView _calendarView = CalendarView.day;

  static const List<String> _weekdayLabels = <String>[
    'MON',
    'TUE',
    'WED',
    'THU',
    'FRI',
    'SAT',
    'SUN',
  ];

  static const List<_DrawerMenuItem> _drawerMenuItems = <_DrawerMenuItem>[
    _DrawerMenuItem(
      icon: Icons.account_circle_outlined,
      title: 'アカウント情報',
      destination: _MenuDestination.accountInfo,
    ),
    _DrawerMenuItem(
      icon: Icons.edit_calendar_outlined,
      title: '予定編集',
      destination: _MenuDestination.scheduleEdit,
    ),
  ];

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
          subject: '専門演習(3・4限)',
          color: Colors.blue.shade700,
        ),
        ownerName: '山田 太郎',
        participants: <String>['山田 太郎', '佐藤 花子', '鈴木 一郎'],
        category: '授業',
        location: '講義棟302教室',
        notification: '15分前',
        description: '専門演習のグループワークと進捗確認を行います。',
      ),
      _AppointmentRecord(
        appointment: Appointment(
          startTime: DateTime(now.year, now.month, now.day + 1, 14, 0),
          endTime: DateTime(now.year, now.month, now.day + 1, 15, 0),
          subject: 'オンライン Web面接',
          color: Colors.orange.shade800,
        ),
        ownerName: '山田 太郎',
        participants: <String>['山田 太郎'],
        category: '面接',
        location: 'オンライン (Zoom)',
        notification: '',
        description: '一次面接。接続確認を事前に行ってください'
      ),
    ];
    _appointmentRecordIndex = <String, _AppointmentRecord>{
      for (final _AppointmentRecord record in _appointmentRecords)
        _appointmentKey(record.appointment): record,
    };
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
              ..._drawerMenuItems.map((item) {
                return _buildDrawerItem(
                  icon: item.icon,
                  title: item.title,
                  destination: item.destination,
                );
              }),
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
                _buildDateMoveButton(
                  tooltip: '1日前へ',
                  dayOffset: -1,
                  icon: Icons.chevron_left,
                ),
                Container(
                  decoration: BoxDecoration(
                    color: Colors.grey.shade100,
                    borderRadius: BorderRadius.circular(10),
                  ),
                  child: Row(
                    mainAxisSize: MainAxisSize.min,
                    children:
                        <CalendarView>[
                          CalendarView.day,
                          CalendarView.month,
                        ].map((CalendarView view) {
                          return _buildViewToggle(
                            view: view,
                            label: view == CalendarView.day ? '1日' : '月',
                          );
                        }).toList(),
                  ),
                ),
                _buildDateMoveButton(
                  tooltip: '1日後へ',
                  dayOffset: 1,
                  icon: Icons.chevron_right,
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
              firstDayOfWeek: 1, // 月曜日始まり
              headerHeight: _calendarView == CalendarView.month ? 46 : 0,
              viewHeaderHeight: _calendarView == CalendarView.month ? 30 : 0,
              todayHighlightColor: Colors.orangeAccent,
              cellBorderColor: Colors.grey.withValues(alpha: 0.1),
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
                          color: meeting.color.withValues(alpha: 0.8),
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

              // タップした時の見た目の仮のポップアップ
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
                  _selectDisplayDate(details.date!, switchToDayView: true);
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
                  _displayDate = _normalizeDate(newDate);
                });
              },
            ),
          ),
        ],
      ),
    );
  }

  IconButton _buildDateMoveButton({
    required String tooltip,
    required int dayOffset,
    required IconData icon,
  }) {
    return IconButton(
      tooltip: tooltip,
      onPressed: () => _moveDisplayDate(dayOffset),
      icon: Icon(icon),
    );
  }

  Widget _buildViewToggle({required CalendarView view, required String label}) {
    return InkWell(
      borderRadius: BorderRadius.circular(10),
      onTap: () => _changeCalendarView(view),
      child: Container(
        padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
        decoration: BoxDecoration(
          color: _calendarView == view
              ? Colors.grey.shade300
              : Colors.transparent,
          borderRadius: BorderRadius.circular(10),
        ),
        child: Text(label),
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

  Widget _buildDrawerItem({
    required IconData icon,
    required String title,
    required _MenuDestination destination,
  }) {
    return ListTile(
      leading: Icon(icon),
      title: Text(title),
      onTap: () => _openMenuPage(destination),
    );
  }

  void _openMenuPage(_MenuDestination destination) {
    Navigator.of(context).pop();
    if (destination == _MenuDestination.accountInfo) {
      Navigator.of(context).push(
        MaterialPageRoute<void>(
          builder: (BuildContext context) => const _AccountInfoPage(),
        ),
      );
      return;
    }
    Navigator.of(context).push(
      MaterialPageRoute<void>(
        builder: (BuildContext context) =>
            _MenuPage(title: _menuDestinationTitle(destination)),
      ),
    );
  }

  String _menuDestinationTitle(_MenuDestination destination) {
    switch (destination) {
      case _MenuDestination.accountInfo:
        return 'アカウント情報';
      case _MenuDestination.scheduleEdit:
        return '予定編集';
    }
  }

  DateTime _startOfWeek(DateTime date) {
    final DateTime normalized = _normalizeDate(date);
    return normalized.subtract(Duration(days: normalized.weekday - 1));
  }

  void _moveDisplayDate(int days) {
    final DateTime base = _normalizeDate(
      _calendarController.displayDate ?? _displayDate,
    );
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
      next = base.add(Duration(days: days));
    }
    _selectDisplayDate(next);
  }

  void _changeCalendarView(CalendarView view) {
    setState(() {
      _calendarView = view;
      _calendarController.view = view;
    });
  }

  void _openAppointmentDetail(_AppointmentRecord record) {
    Navigator.of(context).push(
      MaterialPageRoute<void>(
        builder: (BuildContext context) =>
            _AppointmentDetailPage(record: record),
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

    final DateTime normalized = _normalizeDate(picked);
    _selectDisplayDate(normalized);
  }

  void _selectDisplayDate(DateTime date, {bool switchToDayView = false}) {
    final DateTime normalized = _normalizeDate(date);
    setState(() {
      _displayDate = normalized;
      _calendarController.displayDate = normalized;
      if (switchToDayView) {
        _calendarView = CalendarView.day;
        _calendarController.view = CalendarView.day;
      }
    });
  }

  DateTime _normalizeDate(DateTime date) {
    return DateTime(date.year, date.month, date.day);
  }

  bool _isSameDate(DateTime a, DateTime b) {
    return a.year == b.year && a.month == b.month && a.day == b.day;
  }

  String _weekdayLabel(DateTime date) {
    return _weekdayLabels[date.weekday - 1];
  }

  String _monthYearLabel(DateTime date) {
    return _monthYearFormatter.format(date);
  }

  // サンプルデータ。見た目確認用。
  _DataSource _getDataSource() {
    final List<Appointment> appointments = _appointmentRecords
        .map((_AppointmentRecord record) => record.appointment)
        .toList();
    return _DataSource(appointments);
  }

  _AppointmentRecord? _findRecord(Appointment appointment) {
    return _appointmentRecordIndex[_appointmentKey(appointment)];
  }

  String _appointmentKey(Appointment appointment) {
    return '${appointment.startTime.millisecondsSinceEpoch}_'
        '${appointment.endTime.millisecondsSinceEpoch}_${appointment.subject}';
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
  const _AppointmentDetailPage({required this.record});

  final _AppointmentRecord record;

  static final DateFormat _detailFormatter = DateFormat(
    'yyyy/MM/dd(E) HH:mm',
    'ja_JP',
  );

  @override
  Widget build(BuildContext context) {
    final List<Widget> detailRows = <Widget>[
      _DetailRow(
        label: '開始',
        value: _detailFormatter.format(record.appointment.startTime),
      ),
      _DetailRow(
        label: '終了',
        value: _detailFormatter.format(record.appointment.endTime),
      ),
      _DetailRow(label: '担当者', value: record.ownerName),
      _DetailRow(label: '種別', value: record.category),
      if (record.location.isNotEmpty)
        _DetailRow(label: '場所', value: record.location),
      _DetailRow(label: '参加者', value: record.participants.join(' / ')),
      _DetailRow(label: '通知', value: record.notification),
      _DetailRow(label: 'メモ', value: record.description),
    ];

    return Scaffold(
      appBar: AppBar(title: const Text('予定の詳細')),
      body: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              record.appointment.subject,
              style: const TextStyle(fontSize: 20, fontWeight: FontWeight.bold),
            ),
            const SizedBox(height: 16),
            detailRows.first,
            ...detailRows.skip(1).map((Widget row) {
              return Padding(
                padding: const EdgeInsets.only(top: 8),
                child: row,
              );
            }),
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

  static const List<_AccountSectionItem> _accountSections =
      <_AccountSectionItem>[
        _AccountSectionItem(
          icon: Icons.shield_outlined,
          title: 'セキュリティ',
          subtitle: 'ログイン保護や認証設定',
        ),
        _AccountSectionItem(
          icon: Icons.link_outlined,
          title: '他アカウントサービス',
          subtitle: '外部サービスとの連携管理',
        ),
        _AccountSectionItem(
          icon: Icons.badge_outlined,
          title: 'ID設定',
          subtitle: 'ログインIDの確認・変更',
        ),
        _AccountSectionItem(
          icon: Icons.key_outlined,
          title: 'Pass設定',
          subtitle: 'パスワード変更と管理',
        ),
        _AccountSectionItem(
          icon: Icons.pin_outlined,
          title: 'PIN設定',
          subtitle: 'PINコードによる簡易認証',
        ),
      ];

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('アカウント情報')),
      body: ListView(
        children: [
          const ListTile(
            leading: Icon(Icons.account_circle_outlined),
            title: Text('アカウント概要'),
            subtitle: Text('登録情報や連携状態を確認できます。'),
          ),
          const Divider(height: 1),
          ..._accountSections.map((item) {
            return _AccountSectionTile(
              icon: item.icon,
              title: item.title,
              subtitle: item.subtitle,
            );
          }),
        ],
      ),
    );
  }
}

enum _MenuDestination { accountInfo, scheduleEdit }

class _DrawerMenuItem {
  const _DrawerMenuItem({
    required this.icon,
    required this.title,
    required this.destination,
  });

  final IconData icon;
  final String title;
  final _MenuDestination destination;
}

class _AccountSectionItem {
  const _AccountSectionItem({
    required this.icon,
    required this.title,
    required this.subtitle,
  });

  final IconData icon;
  final String title;
  final String subtitle;
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
        ).showSnackBar(SnackBar(content: Text('$title は準備中です。')));
      },
    );
  }
}
