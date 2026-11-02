import React, { useCallback, useMemo, useRef, useState } from 'react';
import {
  PanResponder,
  ScrollView,
  StyleSheet,
  TextInput,
  View,
} from 'react-native';
import {
  BriefcaseBusiness,
  Building2,
  ChevronDown,
  ChevronLeft,
  GraduationCap,
  MapPin,
  IndianRupee,
  Plus,
  RotateCcw,
  Search,
  X,
} from 'lucide-react-native';
import { AppText } from '../../../components/common';
import Pressable from '../../../components/common/InteractivePressable';
import {
  colors,
  font,
  MAX_FONT_MULTIPLIER,
  radius,
  scale,
  spacing,
  vs,
} from '../../../theme';
import type { JobSeekerJobsParams } from '../api/candidateApi';

const JOB_TYPES = ['Job', 'Internship'];
const EXPERIENCE_LEVELS = ['Entry Level', 'Mid Level'];
const WORK_MODES = ['Remote', 'Hybrid', 'On-site'];
const INDUSTRIES = ['IT Services', 'Education', 'Healthcare', 'Finance', 'Manufacturing', 'Other'];
const FUNCTIONAL_AREAS = [
  'Software Development',
  'IT Support',
  'Data & Analytics',
  'Sales',
  'Marketing',
  'Human Resources',
  'Other',
];
const EDUCATION_LEVELS = ['10th', '12th', 'Diploma', 'Graduation', 'Post Graduation'];
const POSTED_OPTIONS = ['Last 24 Hours', 'Last 3 Days', 'Last Week', 'Last Month'];
const COMPANY_TYPES = ['Startup', 'MNC', 'Government', 'Private'];
const MIN_SALARY_LPA = 1;
const MAX_SALARY_LPA = 80;

export type JobFilterValues = {
  keyword: string;
  location: string;
  jobTypes: string[];
  salaryMin: number;
  salaryMax: number;
  experienceLevel: string[];
  workModes: string[];
  industry: string[];
  functionalArea: string;
  skills: string[];
  education: string[];
  postedWithin: string;
  companyTypes: string[];
};

export const EMPTY_JOB_FILTERS: JobFilterValues = {
  keyword: '',
  location: '',
  jobTypes: [],
  salaryMin: MIN_SALARY_LPA,
  salaryMax: MAX_SALARY_LPA,
  experienceLevel: [],
  workModes: [],
  industry: [],
  functionalArea: '',
  skills: [],
  education: [],
  postedWithin: '',
  companyTypes: [],
};

function toApiParams(filters: JobFilterValues): JobSeekerJobsParams {
  const postedWithinDays: Record<string, number> = {
    'Last 24 Hours': 1,
    'Last 3 Days': 3,
    'Last Week': 7,
    'Last Month': 30,
  };
  return {
    keyword: filters.keyword.trim() || undefined,
    location: filters.location.trim() || undefined,
    jobTypes: filters.jobTypes.length ? filters.jobTypes.join(',') : undefined,
    workModes: filters.workModes.length ? filters.workModes.join(',') : undefined,
    industry: filters.industry.length ? filters.industry.join(',') : undefined,
    postedWithinDays: filters.postedWithin ? postedWithinDays[filters.postedWithin] : undefined,
    companyTypes: filters.companyTypes.length ? filters.companyTypes.join(',') : undefined,
    experienceLevel: filters.experienceLevel.length ? filters.experienceLevel.join(',') : undefined,
    minSalaryLpa: filters.salaryMin > MIN_SALARY_LPA ? filters.salaryMin : undefined,
    maxSalaryLpa: filters.salaryMax < MAX_SALARY_LPA ? filters.salaryMax : undefined,
  };
}

function SectionTitle({
  icon,
  title,
}: {
  icon: React.ReactNode;
  title: string;
}) {
  return (
    <View style={styles.sectionTitle}>
      {icon}
      <AppText variant="bodyBold">{title}</AppText>
    </View>
  );
}

function ToggleOptions({
  options,
  selected,
  onChange,
  multiple = true,
}: {
  options: string[];
  selected: string[];
  onChange: (selected: string[]) => void;
  multiple?: boolean;
}) {
  const toggle = (option: string) => {
    if (!multiple) {
      onChange(selected.includes(option) ? [] : [option]);
      return;
    }
    onChange(
      selected.includes(option)
        ? selected.filter(value => value !== option)
        : [...selected, option],
    );
  };

  return (
    <View style={styles.optionsWrap}>
      {options.map(option => {
        const checked = selected.includes(option);
        return (
          <Pressable
            key={option}
            accessibilityRole={multiple ? 'checkbox' : 'radio'}
            accessibilityState={{ checked }}
            onPress={() => toggle(option)}
            style={({ pressed }) => [
              styles.option,
              checked && styles.optionSelected,
              pressed && styles.optionPressed,
            ]}>
            <View style={[styles.checkbox, checked && styles.checkboxSelected]}>
              {checked ? <View style={styles.checkboxMark} /> : null}
            </View>
            <AppText variant="caption" color={checked ? 'primary' : 'text'}>
              {option}
            </AppText>
          </Pressable>
        );
      })}
    </View>
  );
}

function Dropdown({
  label,
  value,
  placeholder,
  options,
  onChange,
}: {
  label: string;
  value: string;
  placeholder: string;
  options: string[];
  onChange: (value: string) => void;
}) {
  const [open, setOpen] = useState(false);
  return (
    <View>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={`${label}: ${value || placeholder}`}
        onPress={() => setOpen(current => !current)}
        style={({ pressed }) => [styles.dropdown, pressed && styles.optionPressed]}>
        <AppText variant="body" color={value ? 'text' : 'textMuted'}>
          {value || placeholder}
        </AppText>
        <ChevronDown size={scale(18)} color={colors.textSecondary} />
      </Pressable>
      {open ? (
        <View style={styles.dropdownOptions}>
          {options.map(option => (
            <Pressable
              key={option}
              onPress={() => {
                onChange(option);
                setOpen(false);
              }}
              style={({ pressed }) => [styles.dropdownOption, pressed && styles.optionPressed]}>
              <AppText variant="caption" color={option === value ? 'primary' : 'text'}>
                {option}
              </AppText>
            </Pressable>
          ))}
        </View>
      ) : null}
    </View>
  );
}

function MultiSelectDropdown({
  label,
  values,
  placeholder,
  options,
  onChange,
}: {
  label: string;
  values: string[];
  placeholder: string;
  options: string[];
  onChange: (values: string[]) => void;
}) {
  const [open, setOpen] = useState(false);
  return (
    <View>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={`${label}: ${values.length ? values.join(', ') : placeholder}`}
        accessibilityState={{ expanded: open }}
        onPress={() => setOpen(current => !current)}
        style={({ pressed }) => [styles.dropdown, pressed && styles.optionPressed]}>
        <AppText
          variant="body"
          color={values.length ? 'text' : 'textMuted'}
          numberOfLines={2}
          style={styles.dropdownValue}>
          {values.length ? values.join(', ') : placeholder}
        </AppText>
        <ChevronDown size={scale(18)} color={colors.textSecondary} />
      </Pressable>
      {open ? (
        <View style={styles.dropdownOptions}>
          {options.map(option => {
            const selected = values.includes(option);
            return (
              <Pressable
                key={option}
                accessibilityRole="checkbox"
                accessibilityState={{ checked: selected }}
                onPress={() =>
                  onChange(
                    selected
                      ? values.filter(value => value !== option)
                      : [...values, option],
                  )
                }
                style={({ pressed }) => [styles.dropdownOption, pressed && styles.optionPressed]}>
                <View style={[styles.checkbox, selected && styles.checkboxSelected]}>
                  {selected ? <View style={styles.checkboxMark} /> : null}
                </View>
                <AppText variant="caption" color={selected ? 'primary' : 'text'}>
                  {option}
                </AppText>
              </Pressable>
            );
          })}
        </View>
      ) : null}
    </View>
  );
}

function SalaryRangeSlider({
  minimum,
  maximum,
  onChange,
}: {
  minimum: number;
  maximum: number;
  onChange: (minimum: number, maximum: number) => void;
}) {
  const trackRef = useRef<React.ElementRef<typeof View>>(null);
  const trackWidth = useRef(1);
  const trackLeft = useRef(0);
  const thumb = useRef<'minimum' | 'maximum'>('minimum');
  const values = useRef({ minimum, maximum });
  values.current = { minimum, maximum };

  const updateFromX = useCallback((pageX: number) => {
    const ratio = Math.max(0, Math.min(1, (pageX - trackLeft.current) / trackWidth.current));
    const next = Math.round(MIN_SALARY_LPA + ratio * (MAX_SALARY_LPA - MIN_SALARY_LPA));
    if (thumb.current === 'minimum') {
      onChange(Math.min(next, values.current.maximum - 1), values.current.maximum);
    } else {
      onChange(values.current.minimum, Math.max(next, values.current.minimum + 1));
    }
  }, [onChange]);

  const responder = useMemo(
    () =>
      PanResponder.create({
        onStartShouldSetPanResponder: () => true,
        onMoveShouldSetPanResponder: () => true,
        onPanResponderGrant: event => {
          const pageX = event.nativeEvent.pageX;
          trackRef.current?.measureInWindow((left, _top, width) => {
            trackLeft.current = left;
            trackWidth.current = Math.max(width, 1);
            const minX =
              left +
              ((values.current.minimum - MIN_SALARY_LPA) /
                (MAX_SALARY_LPA - MIN_SALARY_LPA)) *
                width;
            const maxX =
              left +
              ((values.current.maximum - MIN_SALARY_LPA) /
                (MAX_SALARY_LPA - MIN_SALARY_LPA)) *
                width;
            thumb.current =
              Math.abs(pageX - minX) <= Math.abs(pageX - maxX)
                ? 'minimum'
                : 'maximum';
            updateFromX(pageX);
          });
        },
        onPanResponderMove: (_event, gesture) => updateFromX(gesture.moveX),
      }),
    [updateFromX],
  );

  const leftPercent =
    ((minimum - MIN_SALARY_LPA) / (MAX_SALARY_LPA - MIN_SALARY_LPA)) * 100;
  const rightPercent =
    ((maximum - MIN_SALARY_LPA) / (MAX_SALARY_LPA - MIN_SALARY_LPA)) * 100;

  return (
    <View style={styles.salarySlider}>
      <View style={styles.salaryValues}>
        <AppText variant="caption" color="textSecondary">₹{minimum} LPA</AppText>
        <AppText variant="caption" color="textSecondary">₹{maximum} LPA</AppText>
      </View>
      <View
        ref={trackRef}
        onLayout={event => {
          trackWidth.current = event.nativeEvent.layout.width;
          trackRef.current?.measureInWindow(left => {
            trackLeft.current = left;
          });
        }}
        {...responder.panHandlers}
        accessibilityRole="adjustable"
        accessibilityLabel={`Annual salary range ${minimum} to ${maximum} lakh rupees`}
        style={styles.sliderTrack}>
        <View style={[styles.sliderSelectedTrack, { left: `${leftPercent}%`, width: `${rightPercent - leftPercent}%` }]} />
        <View style={[styles.sliderThumb, { left: `${leftPercent}%` }]} />
        <View style={[styles.sliderThumb, { left: `${rightPercent}%` }]} />
      </View>
      <AppText variant="caption" color="textMuted">Annual salary in lakhs (LPA)</AppText>
    </View>
  );
}

export default function JobFiltersPanel({
  initialFilters,
  onClose,
  onApply,
  bottomInset,
}: {
  initialFilters: JobFilterValues;
  onClose: () => void;
  onApply: (params: JobSeekerJobsParams, filters: JobFilterValues) => void;
  bottomInset: number;
}) {
  const [filters, setFilters] = useState<JobFilterValues>(initialFilters);
  const [skillInput, setSkillInput] = useState('');
  const update = <K extends keyof JobFilterValues>(key: K, value: JobFilterValues[K]) =>
    setFilters(current => ({ ...current, [key]: value }));

  const addSkill = () => {
    const skill = skillInput.trim();
    if (!skill || filters.skills.some(existing => existing.toLowerCase() === skill.toLowerCase())) {
      return;
    }
    update('skills', [...filters.skills, skill]);
    setSkillInput('');
  };

  const onSalaryChange = useCallback((salaryMin: number, salaryMax: number) => {
    setFilters(current => ({ ...current, salaryMin, salaryMax }));
  }, []);

  const apply = () => onApply(toApiParams(filters), filters);

  return (
    <View style={styles.root}>
      <View style={styles.header}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Back to job search"
          onPress={onClose}
          hitSlop={scale(8)}
          style={styles.backButton}>
          <ChevronLeft size={scale(24)} color={colors.text} />
          <AppText variant="h2">Filters</AppText>
        </Pressable>
        <Pressable
          accessibilityRole="button"
          onPress={() => setFilters({ ...EMPTY_JOB_FILTERS })}
          style={({ pressed }) => [styles.resetButton, pressed && styles.optionPressed]}>
          <RotateCcw size={scale(15)} color={colors.primary} />
          <AppText variant="caption" color="primary" style={styles.resetText}>Reset</AppText>
        </Pressable>
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}>
        <View style={styles.section}>
          <SectionTitle icon={<Search size={scale(17)} color={colors.primary} />} title="Keyword" />
          <TextInput
            value={filters.keyword}
            onChangeText={value => update('keyword', value)}
            placeholder="Search by job title"
            placeholderTextColor={colors.textMuted}
            maxFontSizeMultiplier={MAX_FONT_MULTIPLIER}
            returnKeyType="search"
            style={styles.textInput}
          />
        </View>

        <View style={styles.section}>
          <SectionTitle icon={<MapPin size={scale(17)} color={colors.primary} />} title="Location" />
          <TextInput
            value={filters.location}
            onChangeText={value => update('location', value)}
            placeholder="Enter a city (e.g. Bhopal)"
            placeholderTextColor={colors.textMuted}
            maxFontSizeMultiplier={MAX_FONT_MULTIPLIER}
            style={styles.textInput}
          />
        </View>

        <View style={styles.section}>
          <SectionTitle icon={<BriefcaseBusiness size={scale(17)} color={colors.primary} />} title="Job Type" />
          <ToggleOptions
            options={JOB_TYPES}
            selected={filters.jobTypes}
            onChange={value => update('jobTypes', value)}
          />
        </View>

        <View style={styles.section}>
          <SectionTitle icon={<IndianRupee size={scale(17)} color={colors.primary} />} title="Salary Range" />
          <SalaryRangeSlider
            minimum={filters.salaryMin}
            maximum={filters.salaryMax}
            onChange={onSalaryChange}
          />
        </View>

        <View style={styles.section}>
          <SectionTitle icon={<GraduationCap size={scale(18)} color={colors.primary} />} title="Experience" />
          <ToggleOptions
            options={EXPERIENCE_LEVELS}
            selected={filters.experienceLevel}
            onChange={value => update('experienceLevel', value)}
          />
        </View>

        <View style={styles.section}>
          <SectionTitle icon={<BriefcaseBusiness size={scale(17)} color={colors.primary} />} title="Work Mode" />
          <ToggleOptions
            options={WORK_MODES}
            selected={filters.workModes}
            onChange={value => update('workModes', value)}
          />
        </View>

        <View style={styles.section}>
          <SectionTitle icon={<Building2 size={scale(17)} color={colors.primary} />} title="Industry" />
          <MultiSelectDropdown
            label="Industry"
            values={filters.industry}
            placeholder="Select industries"
            options={INDUSTRIES}
            onChange={value => update('industry', value)}
          />
        </View>

        <View style={styles.section}>
          <SectionTitle icon={<BriefcaseBusiness size={scale(17)} color={colors.primary} />} title="Functional Area" />
          <Dropdown
            label="Functional area"
            value={filters.functionalArea}
            placeholder="Select a functional area"
            options={FUNCTIONAL_AREAS}
            onChange={value => update('functionalArea', value)}
          />
        </View>

        <View style={styles.section}>
          <SectionTitle icon={<Search size={scale(17)} color={colors.primary} />} title="Skills" />
          {filters.skills.length ? (
            <View style={styles.skillsWrap}>
              {filters.skills.map(skill => (
                <Pressable
                  key={skill}
                  accessibilityRole="button"
                  accessibilityLabel={`Remove ${skill}`}
                  onPress={() => update('skills', filters.skills.filter(item => item !== skill))}
                  style={styles.skillChip}>
                  <AppText variant="caption" color="primary">{skill}</AppText>
                  <X size={scale(13)} color={colors.primary} />
                </Pressable>
              ))}
            </View>
          ) : null}
          <View style={styles.addSkillRow}>
            <TextInput
              value={skillInput}
              onChangeText={setSkillInput}
              placeholder="Add a skill"
              placeholderTextColor={colors.textMuted}
              maxFontSizeMultiplier={MAX_FONT_MULTIPLIER}
              onSubmitEditing={addSkill}
              returnKeyType="done"
              style={[styles.textInput, styles.skillInput]}
            />
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Add skill"
              onPress={addSkill}
              style={({ pressed }) => [styles.addSkillButton, pressed && styles.optionPressed]}>
              <Plus size={scale(18)} color={colors.primary} />
              <AppText variant="caption" color="primary">Add</AppText>
            </Pressable>
          </View>
        </View>

        <View style={styles.section}>
          <SectionTitle icon={<GraduationCap size={scale(18)} color={colors.primary} />} title="Education" />
          <ToggleOptions
            options={EDUCATION_LEVELS}
            selected={filters.education}
            onChange={value => update('education', value)}
          />
        </View>

        <View style={styles.section}>
          <SectionTitle icon={<BriefcaseBusiness size={scale(17)} color={colors.primary} />} title="Posted Within" />
          <ToggleOptions
            options={POSTED_OPTIONS}
            selected={filters.postedWithin ? [filters.postedWithin] : []}
            multiple={false}
            onChange={value => update('postedWithin', value[0] ?? '')}
          />
        </View>

        <View style={styles.section}>
          <SectionTitle icon={<Building2 size={scale(17)} color={colors.primary} />} title="Company Type" />
          <ToggleOptions
            options={COMPANY_TYPES}
            selected={filters.companyTypes}
            onChange={value => update('companyTypes', value)}
          />
        </View>
        <AppText variant="caption" color="textMuted" style={styles.unsupportedHint}>
          Skills, education, and functional area are not included in the advanced filter API yet.
        </AppText>
      </ScrollView>

      <View style={[styles.footer, { paddingBottom: Math.max(vs(12), bottomInset) }]}>
        <Pressable
          accessibilityRole="button"
          onPress={apply}
          style={({ pressed }) => [styles.applyButton, pressed && styles.applyPressed]}>
          <AppText variant="bodyBold" color="textOnPrimary">
            Apply Filters
          </AppText>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.background },
  header: {
    minHeight: vs(58),
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
  },
  backButton: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs },
  resetButton: { flexDirection: 'row', alignItems: 'center', gap: scale(5), padding: spacing.xs },
  resetText: { fontWeight: '700' },
  scroll: { flex: 1 },
  content: { paddingHorizontal: spacing.lg, paddingBottom: vs(18) },
  unsupportedHint: { marginTop: vs(14), lineHeight: font(18) },
  section: {
    gap: vs(10),
    paddingVertical: vs(15),
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
  },
  sectionTitle: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  textInput: {
    minHeight: vs(46),
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    paddingHorizontal: spacing.md,
    paddingVertical: vs(8),
    fontSize: font(14),
    color: colors.text,
  },
  optionsWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  option: {
    minHeight: vs(38),
    flexDirection: 'row',
    alignItems: 'center',
    gap: scale(7),
    paddingHorizontal: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    backgroundColor: colors.background,
  },
  optionSelected: { borderColor: colors.primary, backgroundColor: colors.primaryLight },
  optionPressed: { opacity: 0.75 },
  checkbox: {
    width: scale(16),
    height: scale(16),
    borderWidth: 1,
    borderColor: colors.textMuted,
    borderRadius: scale(4),
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxSelected: { borderColor: colors.primary, backgroundColor: colors.primary },
  checkboxMark: { width: scale(7), height: scale(7), borderRadius: scale(2), backgroundColor: colors.background },
  dropdown: {
    minHeight: vs(46),
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    backgroundColor: colors.surface,
  },
  dropdownValue: { flex: 1, minWidth: 0, marginRight: spacing.sm },
  dropdownOptions: {
    marginTop: vs(4),
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    backgroundColor: colors.background,
    overflow: 'hidden',
  },
  dropdownOption: { minHeight: vs(40), justifyContent: 'center', paddingHorizontal: spacing.md },
  salarySlider: { gap: vs(9), paddingHorizontal: spacing.xs },
  salaryValues: { flexDirection: 'row', justifyContent: 'space-between' },
  sliderTrack: {
    height: vs(32),
    justifyContent: 'center',
    marginHorizontal: scale(7),
  },
  sliderSelectedTrack: {
    position: 'absolute',
    height: vs(4),
    borderRadius: radius.pill,
    backgroundColor: colors.primary,
  },
  sliderThumb: {
    position: 'absolute',
    top: '50%',
    width: scale(20),
    height: scale(20),
    marginTop: -scale(10),
    marginLeft: -scale(10),
    borderRadius: radius.pill,
    borderWidth: scale(2),
    borderColor: colors.primary,
    backgroundColor: colors.background,
    elevation: 2,
  },
  skillsWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  skillChip: {
    minHeight: vs(32),
    flexDirection: 'row',
    alignItems: 'center',
    gap: scale(6),
    paddingHorizontal: spacing.sm,
    borderRadius: radius.pill,
    backgroundColor: colors.primaryLight,
  },
  addSkillRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  skillInput: { flex: 1, minWidth: 0 },
  addSkillButton: {
    minHeight: vs(42),
    flexDirection: 'row',
    alignItems: 'center',
    gap: scale(3),
    paddingHorizontal: spacing.sm,
    borderRadius: radius.md,
    backgroundColor: colors.primaryLight,
  },
  footer: {
    paddingHorizontal: spacing.lg,
    paddingTop: vs(10),
    paddingBottom: vs(12),
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.border,
    backgroundColor: colors.background,
  },
  applyButton: {
    minHeight: vs(50),
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radius.md,
    backgroundColor: colors.primary,
  },
  applyPressed: { backgroundColor: colors.primaryDark },
});
