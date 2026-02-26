import Image from 'next/image';
import { User } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { advisor, developers } from '@/data';

const About = () => {
  const allMembers = [
    { ...advisor, type: 'advisor' as const },
    ...developers.members.map((member) => ({
      ...member,
      type: 'developer' as const,
      version: developers.version,
    })),
  ];

  return (
    <div className="container mx-auto px-4 py-16">
      <h1 className="mb-12 text-center text-4xl font-bold">เกี่ยวกับเรา</h1>
      <div className="mx-auto grid max-w-4xl grid-cols-1 gap-6 md:grid-cols-3">
        {allMembers.map((member, index) => (
          <Card key={index} className="text-center">
            <CardContent className="flex flex-col items-center p-6">
              <div className="bg-muted mb-4 flex h-24 w-24 items-center justify-center rounded-full">
                {member.image ? (
                  <Image
                    src={member.image}
                    alt={member.name}
                    width={96}
                    height={96}
                    className="rounded-full object-cover"
                    quality={85}
                    sizes="96px"
                  />
                ) : (
                  <User className="text-muted-foreground h-12 w-12" />
                )}
              </div>
              <h3 className="mb-1 text-xl font-semibold">{member.name}</h3>
              <div className="flex flex-col items-center gap-1">
                <p className="text-muted-foreground text-sm">{member.role}</p>
                {member.type === 'advisor' ? (
                  <Badge variant="secondary">อาจารย์ที่ปรึกษา</Badge>
                ) : (
                  <Badge variant="outline">{member.version}</Badge>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default About;
