import { Injectable } from '@nestjs/common';
import { CreateRouteDto } from './dto/create-route.dto';
import { UpdateRouteDto } from './dto/update-route.dto';
import { PrismaService } from '../prisma/prisma.service';
import { DirectionsService } from '../maps/directions/directions.service';

@Injectable()
export class RoutesService {
  constructor(
    private prismaService: PrismaService,
    private directionsService: DirectionsService,
  ) {}

  async create(createRouteDto: CreateRouteDto) {
    const routeData = await this.getRouteData(
      createRouteDto.name,
      createRouteDto.source_id,
      createRouteDto.destination_id,
    );

    return this.prismaService.route.create({
      data: routeData,
    });
  }

  findAll() {
    return this.prismaService.route.findMany();
  }

  findOne(id: string) {
    return this.prismaService.route.findUniqueOrThrow({
      where: { id },
    });
  }

  async update(id: string, updateRouteDto: UpdateRouteDto) {
    const routeData = await this.getRouteData(
      updateRouteDto.name,
      updateRouteDto.source_id,
      updateRouteDto.destination_id,
    );

    return this.prismaService.route.update({
      where: { id },
      data: routeData,
    });
  }

  remove(id: string) {
    return this.prismaService.route.delete({
      where: { id },
    });
  }

  async getRouteData(name: string, source: string, destination: string) {
    const { available_travel_modes, geocoded_waypoints, routes, request } =
      await this.directionsService.getDirections(source, destination);

    const legs = routes[0].legs[0];
    return {
      name: name,
      source: {
        name: legs.start_address,
        location: {
          lat: legs.start_location.lat,
          lng: legs.start_location.lng,
        },
      },
      destination: {
        name: legs.end_address,
        location: {
          lat: legs.end_location.lat,
          lng: legs.end_location.lng,
        },
      },
      duration: legs.duration.value,
      distance: legs.distance.value,
      directions: JSON.parse(
        JSON.stringify({
          available_travel_modes,
          geocoded_waypoints,
          routes,
          request,
        }),
      ),
    };
  }
}
