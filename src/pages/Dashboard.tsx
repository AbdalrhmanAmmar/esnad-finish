import React, { useState, useEffect, useRef } from "react";
import * as d3 from "d3";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Loader2, TrendingUp, Users, MapPin, Activity } from "lucide-react";
import { getAreaAnalytics, AreaAnalyticsData, AreaAnalyticsFilters } from "@/api/AreaAnalytics";
import { useAuthStore } from "@/stores/authStore";
import { toast } from "@/hooks/use-toast";

const Dashboard: React.FC = () => {
  const { user } = useAuthStore();
  const [data, setData] = useState<AreaAnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState<AreaAnalyticsFilters>({
    detailLevel: "summary",
    includeSubAreas: true,
  });

  // D3 Chart Refs
  const barChartRef = useRef<SVGSVGElement>(null);
  const pieChartRef = useRef<SVGSVGElement>(null);
  const lineChartRef = useRef<SVGSVGElement>(null);
  const heatmapRef = useRef<SVGSVGElement>(null);

  const fetchData = async () => {
    if (!user?._id) return;

    try {
      setLoading(true);
      const response = await getAreaAnalytics(user._id, filters);
      setData(response.data);
    } catch (error) {
      console.error("Error fetching analytics:", error);
      toast({
        title: "خطأ",
        description: "فشل في جلب البيانات",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [user?._id, filters]);

  // D3 Chart Creation Functions
  const createBarChart = (data: any[], containerId: string, title: string) => {
    const container = d3.select(`#${containerId}`);
    container.selectAll("*").remove();

    const margin = { top: 40, right: 30, bottom: 80, left: 80 };
    const width = 500 - margin.left - margin.right;
    const height = 350 - margin.top - margin.bottom;

    const svg = container
      .append("svg")
      .attr("width", width + margin.left + margin.right)
      .attr("height", height + margin.top + margin.bottom)
      .attr("class", "rounded-lg shadow-lg");

    const g = svg.append("g").attr("transform", `translate(${margin.left},${margin.top})`);

    // Gradient definition
    const defs = svg.append("defs");
    const gradient = defs
      .append("linearGradient")
      .attr("id", `gradient-${containerId}`)
      .attr("gradientUnits", "userSpaceOnUse")
      .attr("x1", 0)
      .attr("y1", height)
      .attr("x2", 0)
      .attr("y2", 0);

    gradient
      .append("stop")
      .attr("offset", "0%")
      .attr("stop-color", "#3b82f6")
      .attr("stop-opacity", 0.8);

    gradient
      .append("stop")
      .attr("offset", "100%")
      .attr("stop-color", "#1d4ed8")
      .attr("stop-opacity", 1);

    // Title
    svg
      .append("text")
      .attr("x", (width + margin.left + margin.right) / 2)
      .attr("y", 25)
      .attr("text-anchor", "middle")
      .style("font-size", "18px")
      .style("font-weight", "bold")
      .style("fill", "#1f2937")
      .text(title);

    if (!data || data.length === 0) {
      g.append("text")
        .attr("x", width / 2)
        .attr("y", height / 2)
        .attr("text-anchor", "middle")
        .style("font-size", "16px")
        .style("fill", "#6b7280")
        .text("لا توجد بيانات");
      return;
    }

    const xScale = d3
      .scaleBand()
      .domain(data.map((d) => d.name))
      .range([0, width])
      .padding(0.2);

    const yScale = d3
      .scaleLinear()
      .domain([0, d3.max(data, (d) => d.value) || 0])
      .range([height, 0]);

    // X Axis
    g.append("g")
      .attr("transform", `translate(0,${height})`)
      .call(d3.axisBottom(xScale))
      .selectAll("text")
      .style("text-anchor", "end")
      .style("font-size", "12px")
      .style("fill", "#374151")
      .attr("dx", "-.8em")
      .attr("dy", ".15em")
      .attr("transform", "rotate(-45)");

    // Y Axis
    g.append("g")
      .call(d3.axisLeft(yScale))
      .selectAll("text")
      .style("font-size", "12px")
      .style("fill", "#374151");

    // Bars with animation
    g.selectAll(".bar")
      .data(data)
      .enter()
      .append("rect")
      .attr("class", "bar")
      .attr("x", (d) => xScale(d.name) || 0)
      .attr("width", xScale.bandwidth())
      .attr("y", height)
      .attr("height", 0)
      .attr("fill", `url(#gradient-${containerId})`)
      .attr("rx", 4)
      .attr("ry", 4)
      .transition()
      .duration(800)
      .delay((d, i) => i * 100)
      .attr("y", (d) => yScale(d.value))
      .attr("height", (d) => height - yScale(d.value));

    // Add value labels on bars
    g.selectAll(".value-label")
      .data(data)
      .enter()
      .append("text")
      .attr("class", "value-label")
      .attr("x", (d) => (xScale(d.name) || 0) + xScale.bandwidth() / 2)
      .attr("y", (d) => yScale(d.value) - 5)
      .attr("text-anchor", "middle")
      .style("font-size", "12px")
      .style("font-weight", "bold")
      .style("fill", "#1f2937")
      .style("opacity", 0)
      .text((d) => d.value)
      .transition()
      .duration(800)
      .delay((d, i) => i * 100 + 400)
      .style("opacity", 1);

    // Interactive hover effects
    g.selectAll(".bar")
      .on("mouseover", function (event, d) {
        d3.select(this)
          .transition()
          .duration(200)
          .attr("opacity", 0.8)
          .attr("transform", "scale(1.05)");

        // Enhanced tooltip
        const tooltip = d3
          .select("body")
          .append("div")
          .attr("class", "tooltip")
          .style("position", "absolute")
          .style("background", "linear-gradient(135deg, #667eea 0%, #764ba2 100%)")
          .style("color", "white")
          .style("padding", "12px 16px")
          .style("border-radius", "8px")
          .style("font-size", "14px")
          .style("font-weight", "500")
          .style("box-shadow", "0 4px 6px rgba(0, 0, 0, 0.1)")
          .style("pointer-events", "none")
          .style("opacity", 0);

        tooltip.transition().duration(200).style("opacity", 1);

        tooltip
          .html(
            `<div style="text-align: center;"><strong>${d.name}</strong><br/>القيمة: ${d.value}</div>`
          )
          .style("left", event.pageX + 10 + "px")
          .style("top", event.pageY - 40 + "px");
      })
      .on("mouseout", function () {
        d3.select(this).transition().duration(200).attr("opacity", 1).attr("transform", "scale(1)");
        d3.selectAll(".tooltip").remove();
      });
  };

  // Create Pie Chart for Products Distribution
  const createPieChart = (data: any[], containerId: string, title: string) => {
    const container = d3.select(`#${containerId}`);
    container.selectAll("*").remove();

    const width = 400;
    const height = 400;
    const radius = Math.min(width, height) / 2 - 40;

    const svg = container
      .append("svg")
      .attr("width", width)
      .attr("height", height)
      .attr("class", "rounded-lg shadow-lg");

    const g = svg.append("g").attr("transform", `translate(${width / 2}, ${height / 2})`);

    // Title
    svg
      .append("text")
      .attr("x", width / 2)
      .attr("y", 25)
      .attr("text-anchor", "middle")
      .style("font-size", "18px")
      .style("font-weight", "bold")
      .style("fill", "#1f2937")
      .text(title);

    if (!data || data.length === 0) {
      g.append("text")
        .attr("text-anchor", "middle")
        .style("font-size", "16px")
        .style("fill", "#6b7280")
        .text("لا توجد بيانات");
      return;
    }

    const colorScale = d3
      .scaleOrdinal()
      .domain(data.map((d) => d.name))
      .range([
        "#3b82f6",
        "#10b981",
        "#f59e0b",
        "#ef4444",
        "#8b5cf6",
        "#06b6d4",
        "#84cc16",
        "#f97316",
      ]);

    const pie = d3
      .pie<any>()
      .value((d) => d.value)
      .sort(null);

    const arc = d3.arc<any>().innerRadius(0).outerRadius(radius);

    const outerArc = d3
      .arc<any>()
      .innerRadius(radius * 0.9)
      .outerRadius(radius * 0.9);

    // Create pie slices
    const slices = g.selectAll(".slice").data(pie(data)).enter().append("g").attr("class", "slice");

    slices
      .append("path")
      .attr("d", arc)
      .style("fill", (d) => colorScale(d.data.name))
      .style("stroke", "white")
      .style("stroke-width", "2px")
      .style("opacity", 0)
      .transition()
      .duration(800)
      .delay((d, i) => i * 100)
      .style("opacity", 1)
      .attrTween("d", function (d) {
        const interpolate = d3.interpolate({ startAngle: 0, endAngle: 0 }, d);
        return function (t) {
          return arc(interpolate(t));
        };
      });

    // Add labels
    slices
      .append("text")
      .attr("transform", (d) => {
        const pos = outerArc.centroid(d);
        pos[0] = radius * (midAngle(d) < Math.PI ? 1 : -1);
        return `translate(${pos})`;
      })
      .style("text-anchor", (d) => (midAngle(d) < Math.PI ? "start" : "end"))
      .style("font-size", "12px")
      .style("font-weight", "500")
      .style("fill", "#374151")
      .style("opacity", 0)
      .text((d) => `${d.data.name} (${d.data.value})`)
      .transition()
      .duration(800)
      .delay((d, i) => i * 100 + 400)
      .style("opacity", 1);

    // Add polylines
    slices
      .append("polyline")
      .attr("points", (d) => {
        const pos = outerArc.centroid(d);
        pos[0] = radius * 0.95 * (midAngle(d) < Math.PI ? 1 : -1);
        return [arc.centroid(d), outerArc.centroid(d), pos];
      })
      .style("fill", "none")
      .style("stroke", "#6b7280")
      .style("stroke-width", "1px")
      .style("opacity", 0)
      .transition()
      .duration(800)
      .delay((d, i) => i * 100 + 600)
      .style("opacity", 0.7);

    // Interactive effects
    slices
      .selectAll("path")
      .on("mouseover", function (event, d) {
        d3.select(this)
          .transition()
          .duration(200)
          .style("opacity", 0.8)
          .attr("transform", "scale(1.05)");

        const tooltip = d3
          .select("body")
          .append("div")
          .attr("class", "tooltip")
          .style("position", "absolute")
          .style("background", "linear-gradient(135deg, #667eea 0%, #764ba2 100%)")
          .style("color", "white")
          .style("padding", "12px 16px")
          .style("border-radius", "8px")
          .style("font-size", "14px")
          .style("font-weight", "500")
          .style("box-shadow", "0 4px 6px rgba(0, 0, 0, 0.1)")
          .style("pointer-events", "none")
          .style("opacity", 0);

        tooltip.transition().duration(200).style("opacity", 1);

        const percentage = ((d.data.value / d3.sum(data, (d) => d.value)) * 100).toFixed(1);
        tooltip
          .html(
            `<div style="text-align: center;"><strong>${d.data.name}</strong><br/>الكمية: ${d.data.value}<br/>النسبة: ${percentage}%</div>`
          )
          .style("left", event.pageX + 10 + "px")
          .style("top", event.pageY - 40 + "px");
      })
      .on("mouseout", function () {
        d3.select(this)
          .transition()
          .duration(200)
          .style("opacity", 1)
          .attr("transform", "scale(1)");
        d3.selectAll(".tooltip").remove();
      });

    function midAngle(d: any) {
      return d.startAngle + (d.endAngle - d.startAngle) / 2;
    }
  };

  // D3 Bar Chart for Area Activities
  useEffect(() => {
    if (data && data.areaAnalytics) {
      const chartData = data.areaAnalytics.map((area: any) => ({
        name: area.areaName,
        value: area.combinedStats.totalActivities,
      }));
      createBarChart(chartData, "area-activities-chart", "الأنشطة حسب المنطقة");
    }
  }, [data]);

  // D3 Bar Chart for Doctor Visits
  useEffect(() => {
    if (data && data.areaAnalytics) {
      const chartData = data.areaAnalytics.map((area: any) => ({
        name: area.areaName,
        value: area.doctorVisits.totalVisits,
      }));
      createBarChart(chartData, "doctor-visits-chart", "زيارات الأطباء");
    }
  }, [data]);

  // D3 Bar Chart for Pharmacy Visits
  useEffect(() => {
    if (data && data.areaAnalytics) {
      const chartData = data.areaAnalytics.map((area: any) => ({
        name: area.areaName,
        value: area.pharmacyVisits.totalVisits,
      }));
      createBarChart(chartData, "pharmacy-visits-chart", "زيارات الصيدليات");
    }
  }, [data]);

  // Products Distribution Charts
  useEffect(() => {
    if (data && data.areaAnalytics && data.areaAnalytics.length > 0) {
      // Doctor Products Distribution
      const doctorProducts: { [key: string]: number } = {};
      data.areaAnalytics.forEach((area: any) => {
        if (area.doctorVisits.productsDistributed) {
          Object.entries(area.doctorVisits.productsDistributed).forEach(
            ([product, quantity]: [string, any]) => {
              doctorProducts[product] = (doctorProducts[product] || 0) + quantity;
            }
          );
        }
      });

      const doctorChartData = Object.entries(doctorProducts).map(([name, value]) => ({
        name,
        value,
      }));
      createPieChart(doctorChartData, "doctor-products-chart", "توزيع المنتجات - الأطباء");

      // Pharmacy Products Distribution
      const pharmacyProducts: { [key: string]: number } = {};
      data.areaAnalytics.forEach((area: any) => {
        if (area.pharmacyVisits.productsOrdered) {
          Object.entries(area.pharmacyVisits.productsOrdered).forEach(
            ([product, quantity]: [string, any]) => {
              pharmacyProducts[product] = (pharmacyProducts[product] || 0) + quantity;
            }
          );
        }
      });

      const pharmacyChartData = Object.entries(pharmacyProducts).map(([name, value]) => ({
        name,
        value,
      }));
      createPieChart(pharmacyChartData, "pharmacy-products-chart", "توزيع المنتجات - الصيدليات");
    }
  }, [data]);

  // D3 Pie Chart for Visit Distribution
  useEffect(() => {
    if (!data || !pieChartRef.current) return;

    const svg = d3.select(pieChartRef.current);
    svg.selectAll("*").remove();

    const width = 300;
    const height = 300;
    const radius = Math.min(width, height) / 2;

    const g = svg.append("g").attr("transform", `translate(${width / 2},${height / 2})`);

    const color = d3.scaleOrdinal(d3.schemeCategory10);

    const pieData = [
      { label: "زيارات الأطباء", value: data.summary.totalDoctorVisits },
      { label: "زيارات الصيدليات", value: data.summary.totalPharmacyVisits },
    ];

    const pie = d3.pie<any>().value((d) => d.value);

    const arc = d3.arc<any>().innerRadius(0).outerRadius(radius);

    const arcs = g.selectAll(".arc").data(pie(pieData)).enter().append("g").attr("class", "arc");

    arcs
      .append("path")
      .attr("d", arc)
      .attr("fill", (d, i) => color(i.toString()))
      .transition()
      .duration(800)
      .attrTween("d", function (d) {
        const interpolate = d3.interpolate({ startAngle: 0, endAngle: 0 }, d);
        return function (t) {
          return arc(interpolate(t));
        };
      });

    arcs
      .append("text")
      .attr("transform", (d) => `translate(${arc.centroid(d)})`)
      .attr("dy", ".35em")
      .style("text-anchor", "middle")
      .text((d) => d.data.label);
  }, [data]);

  // D3 Line Chart for Performance Trends
  useEffect(() => {
    if (!data || !lineChartRef.current) return;

    const svg = d3.select(lineChartRef.current);
    svg.selectAll("*").remove();

    const margin = { top: 20, right: 30, bottom: 40, left: 60 };
    const width = 500 - margin.left - margin.right;
    const height = 300 - margin.top - margin.bottom;

    const g = svg.append("g").attr("transform", `translate(${margin.left},${margin.top})`);

    const lineData = data.areaAnalytics.map((area, index) => ({
      x: index,
      y: parseFloat(area.performanceMetrics.samplesPerVisit),
      area: area.areaName,
    }));

    const xScale = d3
      .scaleLinear()
      .domain(d3.extent(lineData, (d) => d.x) as [number, number])
      .range([0, width]);

    const yScale = d3
      .scaleLinear()
      .domain(d3.extent(lineData, (d) => d.y) as [number, number])
      .range([height, 0]);

    const line = d3
      .line<any>()
      .x((d) => xScale(d.x))
      .y((d) => yScale(d.y))
      .curve(d3.curveMonotoneX);

    // Add line
    const path = g
      .append("path")
      .datum(lineData)
      .attr("fill", "none")
      .attr("stroke", "#10b981")
      .attr("stroke-width", 2)
      .attr("d", line);

    const totalLength = path.node()?.getTotalLength() || 0;
    path
      .attr("stroke-dasharray", totalLength + " " + totalLength)
      .attr("stroke-dashoffset", totalLength)
      .transition()
      .duration(1500)
      .attr("stroke-dashoffset", 0);

    // Add dots
    g.selectAll(".dot")
      .data(lineData)
      .enter()
      .append("circle")
      .attr("class", "dot")
      .attr("cx", (d) => xScale(d.x))
      .attr("cy", (d) => yScale(d.y))
      .attr("r", 0)
      .attr("fill", "#10b981")
      .transition()
      .delay(800)
      .duration(500)
      .attr("r", 4);

    // Add axes
    g.append("g").attr("transform", `translate(0,${height})`).call(d3.axisBottom(xScale));

    g.append("g").call(d3.axisLeft(yScale));
  }, [data]);

  const handleFilterChange = (key: keyof AreaAnalyticsFilters, value: any) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="h-8 w-8 animate-spin" />
        <span className="mr-2">جاري تحميل البيانات...</span>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">لوحة التحكم الرئيسية</h1>
          <p className="text-muted-foreground">تحليلات شاملة لأداء المناطق والأنشطة</p>
        </div>
        <Button onClick={fetchData} disabled={loading}>
          {loading ? <Loader2 className="h-4 w-4 animate-spin ml-2" /> : null}
          تحديث البيانات
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>الفلاتر</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <Label htmlFor="area">المنطقة</Label>
              <Input
                id="area"
                placeholder="جميع المناطق"
                value={filters.area || ""}
                onChange={(e) => handleFilterChange("area", e.target.value || undefined)}
              />
            </div>
            <div>
              <Label htmlFor="startDate">من تاريخ</Label>
              <Input
                id="startDate"
                type="date"
                value={filters.startDate || ""}
                onChange={(e) => handleFilterChange("startDate", e.target.value || undefined)}
              />
            </div>
            <div>
              <Label htmlFor="endDate">إلى تاريخ</Label>
              <Input
                id="endDate"
                type="date"
                value={filters.endDate || ""}
                onChange={(e) => handleFilterChange("endDate", e.target.value || undefined)}
              />
            </div>
            <div>
              <Label htmlFor="detailLevel">مستوى التفاصيل</Label>
              <Select
                value={filters.detailLevel}
                onValueChange={(value) => handleFilterChange("detailLevel", value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="summary">ملخص</SelectItem>
                  <SelectItem value="detailed">تفصيلي</SelectItem>
                  <SelectItem value="full">كامل</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {data && (
        <>
          {/* Enhanced KPI Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <Card className="bg-gradient-to-br from-blue-500 via-blue-600 to-blue-700 text-white shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-blue-100 text-sm font-medium mb-1">إجمالي المناطق</p>
                    <p className="text-3xl font-bold mb-2">{data.summary.totalAreas}</p>
                    <div className="flex items-center text-xs text-blue-200">
                      <span className="bg-blue-400 bg-opacity-30 px-2 py-1 rounded-full">نشط</span>
                    </div>
                  </div>
                  <div className="bg-white bg-opacity-20 rounded-full p-4 backdrop-blur-sm">
                    <MapPin className="h-8 w-8" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-green-500 via-green-600 to-green-700 text-white shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-green-100 text-sm font-medium mb-1">زيارات الأطباء</p>
                    <p className="text-3xl font-bold mb-2">{data.summary.totalDoctorVisits}</p>
                    <div className="flex items-center text-xs text-green-200">
                      <span className="bg-green-400 bg-opacity-30 px-2 py-1 rounded-full">
                        {data.summary.totalUniqueDoctors} طبيب فريد
                      </span>
                    </div>
                  </div>
                  <div className="bg-white bg-opacity-20 rounded-full p-4 backdrop-blur-sm">
                    <Activity className="h-8 w-8" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-purple-500 via-purple-600 to-purple-700 text-white shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-purple-100 text-sm font-medium mb-1">زيارات الصيدليات</p>
                    <p className="text-3xl font-bold mb-2">{data.summary.totalPharmacyVisits}</p>
                    <div className="flex items-center text-xs text-purple-200">
                      <span className="bg-purple-400 bg-opacity-30 px-2 py-1 rounded-full">
                        {data.summary.totalUniquePharmacies} صيدلية فريدة
                      </span>
                    </div>
                  </div>
                  <div className="bg-white bg-opacity-20 rounded-full p-4 backdrop-blur-sm">
                    <TrendingUp className="h-8 w-8" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-orange-500 via-orange-600 to-orange-700 text-white shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-orange-100 text-sm font-medium mb-1">العينات الموزعة</p>
                    <p className="text-3xl font-bold mb-2">
                      {data.summary.totalSamplesDistributed}
                    </p>
                    <div className="flex items-center text-xs text-orange-200">
                      <span className="bg-orange-400 bg-opacity-30 px-2 py-1 rounded-full">
                        {(
                          data.summary.totalSamplesDistributed / data.summary.totalDoctorVisits
                        ).toFixed(1)}{" "}
                        لكل زيارة
                      </span>
                    </div>
                  </div>
                  <div className="bg-white bg-opacity-20 rounded-full p-4 backdrop-blur-sm">
                    <Users className="h-8 w-8" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Performance Metrics Dashboard */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <span className="w-3 h-3 bg-indigo-500 rounded-full"></span>
                  مؤشرات الأداء الرئيسية
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {data.areaAnalytics.map((area: any, index: number) => (
                    <div
                      key={index}
                      className="bg-gradient-to-r from-gray-50 to-gray-100 p-4 rounded-lg border"
                    >
                      <h4 className="font-semibold text-gray-900 mb-3">
                        {area.areaName} - {area.city}
                      </h4>
                      <div className="space-y-3">
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-gray-600">تكرار زيارات الأطباء</span>
                          <span className="font-semibold text-blue-600">
                            {area.performanceMetrics.doctorVisitFrequency}
                          </span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-gray-600">معدل طلبيات الصيدليات</span>
                          <span className="font-semibold text-green-600">
                            {area.performanceMetrics.pharmacyOrderRate}
                          </span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-gray-600">متوسط قيمة الطلبية</span>
                          <span className="font-semibold text-purple-600">
                            {area.performanceMetrics.averageOrderValue}
                          </span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-gray-600">العينات لكل زيارة</span>
                          <span className="font-semibold text-orange-600">
                            {area.performanceMetrics.samplesPerVisit}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <span className="w-3 h-3 bg-emerald-500 rounded-full"></span>
                  ملخص الفريق
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {data.areaAnalytics.map((area: any, index: number) => (
                    <div key={index} className="border-b border-gray-200 pb-4 last:border-b-0">
                      <h5 className="font-medium text-gray-900 mb-2">{area.areaName}</h5>
                      <div className="grid grid-cols-2 gap-2 text-sm">
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                          <span className="text-gray-600">
                            مندوبين طبيين: {area.doctorVisits.medicalReps}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                          <span className="text-gray-600">
                            مندوبين مبيعات: {area.pharmacyVisits.salesReps}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                          <span className="text-gray-600">
                            إجمالي الفريق: {area.combinedStats.totalTeamMembers}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                          <span className="text-gray-600">
                            منتجات فريدة: {area.combinedStats.uniqueProducts}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Advanced Analytics Section */}
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 mb-8">
            <Card className="xl:col-span-2">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <span className="w-3 h-3 bg-blue-500 rounded-full"></span>
                  تحليل الأداء المقارن بين المناطق
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div id="area-activities-chart" className="w-full h-96"></div>
                <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
                  {data.areaAnalytics.map((area: any, index: number) => (
                    <div
                      key={index}
                      className="bg-gradient-to-r from-blue-50 to-indigo-50 p-3 rounded-lg border border-blue-200"
                    >
                      <h5 className="font-semibold text-blue-900 text-sm mb-2">{area.areaName}</h5>
                      <div className="space-y-1 text-xs">
                        <div className="flex justify-between">
                          <span className="text-gray-600">كفاءة الزيارات:</span>
                          <span className="font-semibold text-blue-600">
                            {(
                              ((area.doctorVisits.totalVisits / area.doctorVisits.medicalReps) *
                                100) /
                              30
                            ).toFixed(1)}
                            %
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">معدل التحويل:</span>
                          <span className="font-semibold text-green-600">
                            {(
                              (area.pharmacyVisits.totalVisits / area.doctorVisits.totalVisits) *
                              100
                            ).toFixed(1)}
                            %
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <span className="w-3 h-3 bg-purple-500 rounded-full"></span>
                  توزيع المنتجات والعينات
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div id="doctor-products-chart" className="w-full h-64 mb-4"></div>
                <div className="space-y-3">
                  {data.areaAnalytics.slice(0, 3).map((area: any, index: number) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-2 bg-gray-50 rounded"
                    >
                      <div className="flex items-center gap-2">
                        <div
                          className={`w-3 h-3 rounded-full ${
                            index === 0
                              ? "bg-blue-500"
                              : index === 1
                              ? "bg-purple-500"
                              : "bg-green-500"
                          }`}
                        ></div>
                        <span className="text-sm font-medium">{area.areaName}</span>
                      </div>
                      <span className="text-sm text-gray-600">
                        {area.combinedStats.totalActivities} نشاط
                      </span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Trend Analysis Section */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <span className="w-3 h-3 bg-emerald-500 rounded-full"></span>
                  اتجاهات الأداء الشهرية
                </CardTitle>
              </CardHeader>
              <CardContent>
                {/* <div className="space-y-4">
                  <div className="grid grid-cols-3 gap-4 text-center">
                    <div className="bg-gradient-to-r from-green-100 to-emerald-100 p-4 rounded-lg">
                      <div className="text-2xl font-bold text-green-600">+15%</div>
                      <div className="text-sm text-gray-600">نمو زيارات الأطباء</div>
                    </div>
                    <div className="bg-gradient-to-r from-blue-100 to-cyan-100 p-4 rounded-lg">
                      <div className="text-2xl font-bold text-blue-600">+22%</div>
                      <div className="text-sm text-gray-600">زيادة طلبيات الصيدليات</div>
                    </div>
                    <div className="bg-gradient-to-r from-purple-100 to-violet-100 p-4 rounded-lg">
                      <div className="text-2xl font-bold text-purple-600">+8%</div>
                      <div className="text-sm text-gray-600">تحسن معدل التحويل</div>
                    </div>
                  </div>
                  <div className="mt-6">
                    <h5 className="font-semibold mb-3">أهداف الشهر القادم</h5>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between p-2 bg-yellow-50 rounded border border-yellow-200">
                        <span className="text-sm">زيادة تغطية المناطق</span>
                        <span className="text-xs bg-yellow-200 px-2 py-1 rounded-full">هدف: +10%</span>
                      </div>
                      <div className="flex items-center justify-between p-2 bg-green-50 rounded border border-green-200">
                        <span className="text-sm">تحسين معدل العينات</span>
                        <span className="text-xs bg-green-200 px-2 py-1 rounded-full">هدف: +5%</span>
                      </div>
                    </div>
                  </div>
                </div> */}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <span className="w-3 h-3 bg-rose-500 rounded-full"></span>
                  تحليل المخاطر والفرص
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <h5 className="font-semibold text-red-600 mb-2">المخاطر المحتملة</h5>
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 p-2 bg-red-50 rounded border border-red-200">
                        <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                        <span className="text-sm">
                          انخفاض في منطقة{" "}
                          {data.areaAnalytics.length > 0
                            ? data.areaAnalytics.reduce((min: any, area: any) =>
                                (area.doctorVisits?.totalVisits || 0) <
                                (min.doctorVisits?.totalVisits || 0)
                                  ? area
                                  : min
                              ).areaName
                            : "غير محدد"}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 p-2 bg-orange-50 rounded border border-orange-200">
                        <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                        <span className="text-sm">حاجة لزيادة فريق المبيعات</span>
                      </div>
                    </div>
                  </div>
                  <div>
                    <h5 className="font-semibold text-green-600 mb-2">الفرص المتاحة</h5>
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 p-2 bg-green-50 rounded border border-green-200">
                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                        <span className="text-sm">
                          توسع في منطقة{" "}
                          {data.areaAnalytics.length > 0
                            ? data.areaAnalytics.reduce((max: any, area: any) =>
                                (area.doctorVisits?.totalVisits || 0) >
                                (max.doctorVisits?.totalVisits || 0)
                                  ? area
                                  : max
                              ).areaName
                            : "غير محدد"}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 p-2 bg-blue-50 rounded border border-blue-200">
                        <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                        <span className="text-sm">زيادة توزيع المنتجات الرئيسية</span>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Additional Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>زيارات الأطباء</CardTitle>
              </CardHeader>
              <CardContent>
                <div id="doctor-visits-chart"></div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>زيارات الصيدليات</CardTitle>
              </CardHeader>
              <CardContent>
                <div id="pharmacy-visits-chart"></div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>توزيع المنتجات - الصيدليات</CardTitle>
              </CardHeader>
              <CardContent>
                <div id="pharmacy-products-chart"></div>
              </CardContent>
            </Card>
          </div>

          {/* Performance Trends */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
            <Card>
              <CardHeader>
                <CardTitle>معدل العينات لكل زيارة</CardTitle>
              </CardHeader>
              <CardContent>
                <svg ref={lineChartRef} width="500" height="300"></svg>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>أفضل المناطق أداءً</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {data.topPerformingAreas.slice(0, 5).map((area, index) => (
                    <div
                      key={area.areaName}
                      className="flex items-center justify-between p-3 bg-muted rounded-lg"
                    >
                      <div>
                        <p className="font-medium">{area.areaName}</p>
                        <p className="text-sm text-muted-foreground">{area.city}</p>
                      </div>
                      <Badge variant="secondary">{area.combinedStats.totalActivities} نشاط</Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Insights */}
          <Card>
            <CardHeader>
              <CardTitle>رؤى وتحليلات</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {data.insights.map((insight, index) => (
                  <div
                    key={index}
                    className="p-4 bg-blue-50 dark:bg-blue-950 rounded-lg border border-blue-200 dark:border-blue-800"
                  >
                    <p className="text-blue-800 dark:text-blue-200">{insight}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Products Details Section */}
          <div className="mt-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">تفاصيل المنتجات والعلاقات</h2>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
              {/* Doctor Products Table */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <span className="w-3 h-3 bg-blue-500 rounded-full"></span>
                    المنتجات الموزعة على الأطباء
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b border-gray-200">
                          <th className="text-right py-3 px-4 font-semibold text-gray-700">
                            اسم المنتج
                          </th>
                          <th className="text-right py-3 px-4 font-semibold text-gray-700">
                            الكمية الموزعة
                          </th>
                          <th className="text-right py-3 px-4 font-semibold text-gray-700">
                            المنطقة
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {data.areaAnalytics.map(
                          (area: any, areaIndex: number) =>
                            area.doctorVisits.productsDistributed &&
                            Object.entries(area.doctorVisits.productsDistributed).map(
                              ([product, quantity]: [string, any], productIndex: number) => (
                                <tr
                                  key={`${areaIndex}-${productIndex}`}
                                  className="border-b border-gray-100 hover:bg-blue-50 transition-colors"
                                >
                                  <td className="py-3 px-4 font-medium text-gray-900">{product}</td>
                                  <td className="py-3 px-4">
                                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                      {quantity} عينة
                                    </span>
                                  </td>
                                  <td className="py-3 px-4 text-gray-600">{area.areaName}</td>
                                </tr>
                              )
                            )
                        )}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>

              {/* Pharmacy Products Table */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <span className="w-3 h-3 bg-green-500 rounded-full"></span>
                    المنتجات المطلوبة من الصيدليات
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b border-gray-200">
                          <th className="text-right py-3 px-4 font-semibold text-gray-700">
                            اسم المنتج
                          </th>
                          <th className="text-right py-3 px-4 font-semibold text-gray-700">
                            الكمية المطلوبة
                          </th>
                          <th className="text-right py-3 px-4 font-semibold text-gray-700">
                            المنطقة
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {data.areaAnalytics.map(
                          (area: any, areaIndex: number) =>
                            area.pharmacyVisits.productsOrdered &&
                            Object.entries(area.pharmacyVisits.productsOrdered).map(
                              ([product, quantity]: [string, any], productIndex: number) => (
                                <tr
                                  key={`${areaIndex}-${productIndex}`}
                                  className="border-b border-gray-100 hover:bg-green-50 transition-colors"
                                >
                                  <td className="py-3 px-4 font-medium text-gray-900">{product}</td>
                                  <td className="py-3 px-4">
                                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                      {quantity} وحدة
                                    </span>
                                  </td>
                                  <td className="py-3 px-4 text-gray-600">{area.areaName}</td>
                                </tr>
                              )
                            )
                        )}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Products Comparison */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <span className="w-3 h-3 bg-purple-500 rounded-full"></span>
                  مقارنة المنتجات بين الأطباء والصيدليات
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-gray-200">
                        <th className="text-right py-3 px-4 font-semibold text-gray-700">
                          اسم المنتج
                        </th>
                        <th className="text-right py-3 px-4 font-semibold text-gray-700">
                          العينات الموزعة (أطباء)
                        </th>
                        <th className="text-right py-3 px-4 font-semibold text-gray-700">
                          الطلبيات (صيدليات)
                        </th>
                        <th className="text-right py-3 px-4 font-semibold text-gray-700">
                          معدل التحويل
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {(() => {
                        const productComparison: {
                          [key: string]: { doctor: number; pharmacy: number };
                        } = {};

                        // Collect doctor products
                        data.areaAnalytics.forEach((area: any) => {
                          if (area.doctorVisits.productsDistributed) {
                            Object.entries(area.doctorVisits.productsDistributed).forEach(
                              ([product, quantity]: [string, any]) => {
                                if (!productComparison[product])
                                  productComparison[product] = { doctor: 0, pharmacy: 0 };
                                productComparison[product].doctor += quantity;
                              }
                            );
                          }
                        });

                        // Collect pharmacy products
                        data.areaAnalytics.forEach((area: any) => {
                          if (area.pharmacyVisits.productsOrdered) {
                            Object.entries(area.pharmacyVisits.productsOrdered).forEach(
                              ([product, quantity]: [string, any]) => {
                                if (!productComparison[product])
                                  productComparison[product] = { doctor: 0, pharmacy: 0 };
                                productComparison[product].pharmacy += quantity;
                              }
                            );
                          }
                        });

                        return Object.entries(productComparison).map(([product, data], index) => {
                          const conversionRate =
                            data.doctor > 0
                              ? ((data.pharmacy / data.doctor) * 100).toFixed(1)
                              : "0";
                          return (
                            <tr
                              key={index}
                              className="border-b border-gray-100 hover:bg-purple-50 transition-colors"
                            >
                              <td className="py-3 px-4 font-medium text-gray-900">{product}</td>
                              <td className="py-3 px-4">
                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                  {data.doctor} عينة
                                </span>
                              </td>
                              <td className="py-3 px-4">
                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                  {data.pharmacy} وحدة
                                </span>
                              </td>
                              <td className="py-3 px-4">
                                <span
                                  className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                    parseFloat(conversionRate) > 50
                                      ? "bg-green-100 text-green-800"
                                      : parseFloat(conversionRate) > 25
                                      ? "bg-yellow-100 text-yellow-800"
                                      : "bg-red-100 text-red-800"
                                  }`}
                                >
                                  {conversionRate}%
                                </span>
                              </td>
                            </tr>
                          );
                        });
                      })()}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>

            {/* Advanced Analytics & Smart Recommendations */}
            <div className="grid grid-cols-1 xl:grid-cols-4 gap-6 mt-8">
              <Card className="xl:col-span-2">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <span className="w-3 h-3 bg-indigo-500 rounded-full"></span>
                    تقرير الأداء التفاعلي
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    {data.areaAnalytics.map((area: any, index: number) => {
                      const efficiency =
                        ((area.doctorVisits.totalVisits / area.doctorVisits.medicalReps) * 100) /
                        30;
                      const conversionRate =
                        (area.pharmacyVisits.totalVisits / area.doctorVisits.totalVisits) * 100;
                      const samplesPerVisit =
                        area.doctorVisits.products && area.doctorVisits.products.length > 0
                          ? area.doctorVisits.products.reduce(
                              (sum: number, p: any) => sum + p.samplesDistributed,
                              0
                            ) / area.doctorVisits.totalVisits
                          : 0;

                      return (
                        <div
                          key={index}
                          className="bg-gradient-to-r from-slate-50 to-gray-100 p-4 rounded-xl border border-gray-200 hover:shadow-lg transition-all duration-300"
                        >
                          <div className="flex items-center justify-between mb-4">
                            <h4 className="font-bold text-gray-900">
                              {area.areaName} - {area.city}
                            </h4>
                            <div
                              className={`px-3 py-1 rounded-full text-xs font-semibold ${
                                efficiency > 80
                                  ? "bg-green-100 text-green-800"
                                  : efficiency > 60
                                  ? "bg-yellow-100 text-yellow-800"
                                  : "bg-red-100 text-red-800"
                              }`}
                            >
                              {efficiency > 80 ? "ممتاز" : efficiency > 60 ? "جيد" : "يحتاج تحسين"}
                            </div>
                          </div>

                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            <div className="text-center">
                              <div className="text-2xl font-bold text-blue-600">
                                {area.doctorVisits.totalVisits}
                              </div>
                              <div className="text-xs text-gray-600">زيارات أطباء</div>
                            </div>
                            <div className="text-center">
                              <div className="text-2xl font-bold text-green-600">
                                {area.pharmacyVisits.totalVisits}
                              </div>
                              <div className="text-xs text-gray-600">زيارات صيدليات</div>
                            </div>
                            <div className="text-center">
                              <div className="text-2xl font-bold text-purple-600">
                                {conversionRate.toFixed(1)}%
                              </div>
                              <div className="text-xs text-gray-600">معدل التحويل</div>
                            </div>
                            <div className="text-center">
                              <div className="text-2xl font-bold text-orange-600">
                                {samplesPerVisit.toFixed(1)}
                              </div>
                              <div className="text-xs text-gray-600">عينات/زيارة</div>
                            </div>
                          </div>

                          <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-3">
                            <div className="bg-white p-3 rounded-lg border">
                              <div className="text-sm font-medium text-gray-700 mb-1">
                                كفاءة الفريق
                              </div>
                              <div className="w-full bg-gray-200 rounded-full h-2">
                                <div
                                  className={`h-2 rounded-full ${
                                    efficiency > 80
                                      ? "bg-green-500"
                                      : efficiency > 60
                                      ? "bg-yellow-500"
                                      : "bg-red-500"
                                  }`}
                                  style={{ width: `${Math.min(efficiency, 100)}%` }}
                                ></div>
                              </div>
                              <div className="text-xs text-gray-600 mt-1">
                                {efficiency.toFixed(1)}% من الهدف
                              </div>
                            </div>

                            <div className="bg-white p-3 rounded-lg border">
                              <div className="text-sm font-medium text-gray-700 mb-1">
                                تقييم الأداء
                              </div>
                              <div className="flex items-center gap-1">
                                {[1, 2, 3, 4, 5].map((star) => (
                                  <svg
                                    key={star}
                                    className={`w-4 h-4 ${
                                      star <= Math.ceil(efficiency / 20)
                                        ? "text-yellow-400"
                                        : "text-gray-300"
                                    }`}
                                    fill="currentColor"
                                    viewBox="0 0 20 20"
                                  >
                                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                  </svg>
                                ))}
                                <span className="text-xs text-gray-600 ml-2">
                                  {Math.ceil(efficiency / 20)}/5
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <span className="w-3 h-3 bg-cyan-500 rounded-full"></span>
                    التوصيات الذكية
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="bg-gradient-to-r from-blue-50 to-cyan-50 p-4 rounded-lg border border-blue-200">
                      <div className="flex items-center gap-2 mb-2">
                        <svg
                          className="w-5 h-5 text-blue-600"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path
                            fillRule="evenodd"
                            d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                            clipRule="evenodd"
                          />
                        </svg>
                        <span className="font-semibold text-blue-800">تحسين الكفاءة</span>
                      </div>
                      <p className="text-sm text-blue-700">
                        زيادة عدد الزيارات في المناطق ذات الأداء المنخفض بنسبة 25%
                      </p>
                    </div>

                    <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-4 rounded-lg border border-green-200">
                      <div className="flex items-center gap-2 mb-2">
                        <svg
                          className="w-5 h-5 text-green-600"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path
                            fillRule="evenodd"
                            d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                            clipRule="evenodd"
                          />
                        </svg>
                        <span className="font-semibold text-green-800">فرصة نمو</span>
                      </div>
                      <p className="text-sm text-green-700">
                        التركيز على المنتجات عالية الطلب في المناطق النشطة
                      </p>
                    </div>

                    <div className="bg-gradient-to-r from-purple-50 to-violet-50 p-4 rounded-lg border border-purple-200">
                      <div className="flex items-center gap-2 mb-2">
                        <svg
                          className="w-5 h-5 text-purple-600"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path
                            fillRule="evenodd"
                            d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zM3 10a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1v-6zM14 9a1 1 0 00-1 1v6a1 1 0 001 1h2a1 1 0 001-1v-6a1 1 0 00-1-1h-2z"
                            clipRule="evenodd"
                          />
                        </svg>
                        <span className="font-semibold text-purple-800">تطوير الفريق</span>
                      </div>
                      <p className="text-sm text-purple-700">
                        تدريب إضافي للمندوبين في المناطق ذات الأداء المنخفض
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <span className="w-3 h-3 bg-amber-500 rounded-full"></span>
                    إحصائيات متقدمة
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="bg-gradient-to-r from-amber-50 to-yellow-50 p-4 rounded-lg border border-amber-200">
                      <div className="text-center">
                        <div className="text-3xl font-bold text-amber-600 mb-1">
                          {data.summary.totalDoctorVisits > 0
                            ? (
                                data.summary.totalSamplesDistributed /
                                data.summary.totalDoctorVisits
                              ).toFixed(2)
                            : "0.00"}
                        </div>
                        <div className="text-sm text-amber-700">متوسط العينات لكل زيارة طبيب</div>
                      </div>
                    </div>

                    <div className="bg-gradient-to-r from-rose-50 to-pink-50 p-4 rounded-lg border border-rose-200">
                      <div className="text-center">
                        <div className="text-3xl font-bold text-rose-600 mb-1">
                          {data.summary.totalDoctorVisits > 0
                            ? (
                                (data.summary.totalPharmacyVisits /
                                  data.summary.totalDoctorVisits) *
                                100
                              ).toFixed(1)
                            : "0.0"}
                          %
                        </div>
                        <div className="text-sm text-rose-700">معدل التحويل الإجمالي</div>
                      </div>
                    </div>

                    <div className="bg-gradient-to-r from-teal-50 to-cyan-50 p-4 rounded-lg border border-teal-200">
                      <div className="text-center">
                        <div className="text-3xl font-bold text-teal-600 mb-1">
                          {data.areaAnalytics.reduce(
                            (sum: number, area: any) =>
                              sum + (area.combinedStats?.totalTeamMembers || 0),
                            0
                          )}
                        </div>
                        <div className="text-sm text-teal-700">إجمالي أعضاء الفريق</div>
                      </div>
                    </div>

                    <div className="bg-gradient-to-r from-indigo-50 to-blue-50 p-4 rounded-lg border border-indigo-200">
                      <div className="text-center">
                        <div className="text-3xl font-bold text-indigo-600 mb-1">
                          {data.areaAnalytics.reduce(
                            (sum: number, area: any) =>
                              sum + (area.combinedStats?.uniqueProducts || 0),
                            0
                          )}
                        </div>
                        <div className="text-sm text-indigo-700">إجمالي المنتجات الفريدة</div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Insights Section */}
            {data.insights && data.insights.length > 0 && (
              <Card className="mt-6">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <span className="w-3 h-3 bg-amber-500 rounded-full"></span>
                    الرؤى والتحليلات
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {data.insights.map((insight: string, index: number) => (
                      <div
                        key={index}
                        className="p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-200"
                      >
                        <div className="flex items-start gap-3">
                          <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                          <p className="text-gray-700 text-sm leading-relaxed">{insight}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default Dashboard;
