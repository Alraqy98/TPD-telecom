/** Slides shown only when assessment outcome is Acceleration Track */
export const ACCELERATION_ONLY_SLIDES = [
  'slideAccelPositioning',
  'slideAccelDeepDive',
  'slideAccelObjective',
  'slideAccelValue',
] as const;

/** Standard governance / revenue deep-dive slides (hidden for Acceleration) */
export const STANDARD_DEEP_DIVE_SLIDES = ['slide6', 'slide7'] as const;

const PRE_ASSESSMENT_SLIDES = [
  'slideIntroLogo',
  'hero',
  'slideConcept',
  'slide3',
  'slide4',
  'slide2',
  'slideGap',
  'slide8',
  'slideTimeline',
  'slide5',
] as const;

const POST_DEEP_DIVE_SLIDES = ['slide9', 'slide10', 'slide11', 'thanks'] as const;

export type PresentationSlideId =
  | (typeof PRE_ASSESSMENT_SLIDES)[number]
  | (typeof ACCELERATION_ONLY_SLIDES)[number]
  | (typeof STANDARD_DEEP_DIVE_SLIDES)[number]
  | (typeof POST_DEEP_DIVE_SLIDES)[number];

/** Full deck for PDF export (includes both deep-dive paths) */
export const PDF_SLIDE_DECK: PresentationSlideId[] = [
  ...PRE_ASSESSMENT_SLIDES,
  ...ACCELERATION_ONLY_SLIDES,
  ...STANDARD_DEEP_DIVE_SLIDES,
  ...POST_DEEP_DIVE_SLIDES,
];

export function buildPresentationSlides(
  isAccelerationOutcome: boolean
): PresentationSlideId[] {
  return [
    ...PRE_ASSESSMENT_SLIDES,
    ...(isAccelerationOutcome
      ? ACCELERATION_ONLY_SLIDES
      : STANDARD_DEEP_DIVE_SLIDES),
    ...POST_DEEP_DIVE_SLIDES,
  ];
}
