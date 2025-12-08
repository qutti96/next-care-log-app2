import { ChildAgeInfo } from '@/types';
import { formatBirthDate } from '@/lib/utils/childAgeUtils';

interface ChildAgeDisplayProps {
  birthday: Date;
  age: ChildAgeInfo;
  showDetailedInfo?: boolean;
}

export function ChildAgeDisplay({
  birthday,
  age,
  showDetailedInfo = false
}: ChildAgeDisplayProps) {
  return (
    <div className="space-y-1">
      <div className="flex items-center gap-2">
        <span className="text-sm text-gray-600">月齢:</span>
        <span className="font-medium text-blue-600">{age.displayText}</span>
        {age.isInfant && (
          <span className="px-2 py-1 text-xs bg-pink-100 text-pink-800 rounded-full">
            乳児
          </span>
        )}
        {age.isToddler && (
          <span className="px-2 py-1 text-xs bg-green-100 text-green-800 rounded-full">
            幼児
          </span>
        )}
      </div>

      {showDetailedInfo && (
        <div className="text-sm text-gray-500">
          生年月日: {formatBirthDate(birthday)}
          <span className="ml-2">
            (総月齢: {age.totalMonths}ヶ月)
          </span>
        </div>
      )}
    </div>
  );
}
